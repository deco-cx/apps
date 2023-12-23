import { badRequest } from "deco/mod.ts";
import { delay } from "std/async/mod.ts";
import { k8s } from "../../deps.ts";
import { hashString } from "../../hash/shortHash.ts";
import { ignoreIfExists } from "../../k8s/objects.ts";
import { AppContext } from "../../mod.ts";

export interface Props {
  site: string;
  commitSha: string;
  repo: string;
  owner: string;
  builderImage?: string;
}

const DECO_SITES_PVC = "deco-sites-sources";
interface BuildJobOpts {
  name: string;
  commitSha: string;
  repo: string;
  owner: string;
  namespace: string;
  site: string;
  builderImage: string;
  sourceBinder: SourceBinder;
}

export interface VolumeBinder {
  claimName: string;
  mountPath: string;
  sourcePath: string;
}

export const SrcBinder = {
  fromRepo: (owner: string, repo: string, commitSha: string): SourceBinder => {
    return {
      claimName: DECO_SITES_PVC,
      mountPath: `/${DECO_SITES_PVC}`,
      sourcePath: `/${DECO_SITES_PVC}/${owner}/${repo}/${commitSha}/source.tar`,
    };
  },
};

export type SourceBinder = VolumeBinder;
const buildJobOf = (
  {
    name,
    commitSha,
    repo,
    owner,
    namespace,
    site,
    builderImage,
    sourceBinder,
  }: BuildJobOpts,
): k8s.V1Job => {
  const sourcesMountPath = "/deco-sites-sources";
  const sourceLocalMountPath = "/app/deco";
  const cacheLocalMountPath = "/cache";
  const esbuildCacheMountPath = "/esbuild-cache";
  return {
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: {
      name,
      namespace,
      labels: {
        site,
        repo,
        owner,
      },
    },
    spec: {
      backoffLimit: 0,
      ttlSecondsAfterFinished: 60 * 60 * 2, // 2 hours
      template: {
        spec: {
          volumes: [{
            name: "cache-local",
            emptyDir: {},
          }, {
            name: "source-local",
            emptyDir: {},
          }, {
            name: "esbuild-cache",
            emptyDir: {},
          }, {
            name: "assets",
            persistentVolumeClaim: {
              claimName: sourceBinder.claimName,
            },
          }],
          containers: [
            {
              command: ["sh", "/build.sh"],
              name: "builder",
              image: builderImage, // Use any image you want
              env: [
                {
                  name: "DECO_SITE_NAME",
                  value: site,
                },
                {
                  name: "CACHE_LOCAL_DIR",
                  value: cacheLocalMountPath,
                },
                {
                  name: "SOURCE_LOCAL_DIR",
                  value: sourceLocalMountPath,
                },
                {
                  name: "SOURCE_REMOTE_OUTPUT",
                  value: sourceBinder.sourcePath,
                },
                {
                  name: "CACHE_REMOTE_OUTPUT",
                  value: `${sourceBinder.mountPath}/${owner}/${repo}/cache.tar`,
                },
                {
                  name: "GIT_REPO",
                  value: `https://github.com/${owner}/${repo}`,
                },
                {
                  name: "COMMIT_SHA",
                  value: commitSha,
                },
                {
                  name: "DENO_DIR",
                  value: cacheLocalMountPath,
                },
                {
                  name: "XDG_CACHE_HOME",
                  value: esbuildCacheMountPath,
                },
                {
                  name: "NAMESPACE",
                  value: namespace,
                },
                {
                  name: "GITHUB_TOKEN",
                  valueFrom: {
                    secretKeyRef: {
                      name: "github-token",
                      key: "token",
                    },
                  },
                },
              ],
              volumeMounts: [
                {
                  name: "esbuild-cache",
                  mountPath: esbuildCacheMountPath,
                },
                {
                  name: "cache-local",
                  mountPath: cacheLocalMountPath,
                },
                {
                  name: "source-local",
                  mountPath: sourceLocalMountPath,
                },
                {
                  name: "assets",
                  mountPath: sourcesMountPath,
                },
              ],
            },
          ],
          restartPolicy: "Never",
        },
      },
    },
  };
};

/**
 * this function is an heuristic that says that in 99% of the cases when the build will fail it will happen in the first five seconds.
 */
const getBuildStatus = (buildStartTimeMs: number) =>
async (
  api: k8s.BatchV1Api,
  namespace: string,
  jobName: string,
): Promise<BuildStatus> => {
  const job = await api.readNamespacedJob(jobName, namespace);
  const jobStatus = job.body.status;
  if (!jobStatus) {
    return "running" as const;
  }

  const condition = (jobStatus.conditions ?? []).find((
    cond: k8s.V1JobCondition,
  ) => cond.status === "True");
  if (!condition) {
    if (performance.now() - buildStartTimeMs > 5_000) {
      return "will_probably_succeed";
    }
    return "running" as const;
  }

  return condition.type === "Complete" ? "succeed" : "failed";
};

const finalStatus: BuildStatus[] = ["succeed", "failed"];
const waitWithPooling =
  (getStatusFunc: () => Promise<BuildStatus>, pollingDelayMs: number) =>
  async (status: BuildStatus, timeoutMs?: number) => {
    let timedOut = false;
    const timeout = timeoutMs && setTimeout(() => {
      timedOut = true;
    }, timeoutMs);
    const isProbablySucceed = status === "will_probably_succeed";
    try {
      const waitUntil = async () => {
        const currentStatus = await getStatusFunc();
        if (
          currentStatus === status ||
          (isProbablySucceed && currentStatus === "succeed")
        ) {
          return;
        }

        // unexpected final status
        if (finalStatus.includes(currentStatus)) {
          throw new Error(`unexpected final job status ${currentStatus}`);
        }
        if (timedOut) {
          throw new Error("timeout");
        }
        await delay(pollingDelayMs);
        await waitUntil();
      };
      return await waitUntil();
    } finally {
      timeout && clearTimeout(timeout);
    }
  };
export type BuildStatus =
  | "succeed"
  | "failed"
  | "will_probably_succeed"
  | "running";

export interface BuildResult {
  sourceBinder: SourceBinder;
  getBuildStatus: () => Promise<BuildStatus>;
  waitUntil: (status: BuildStatus, timeoutMs?: number) => Promise<void>;
}

/**
 * Builds a specific commit repo and owner using the given builder image or getting from builder image default.
 */
export default async function build(
  { commitSha, repo, owner, site, builderImage }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BuildResult> {
  const { loaders } = ctx.invoke["deco-sites/admin"];
  const builderImg = builderImage ??
    (await loaders.k8s.builderConfig().then((b) => b.image));
  const batchAPI = ctx.kc.makeApiClient(k8s.BatchV1Api);
  const binder = SrcBinder.fromRepo(owner, repo, commitSha);
  // Define the Job specification
  const job = buildJobOf({
    name: `build-${await hashString(
      `build-${commitSha}-${owner}-${repo}`,
    )}`,
    commitSha,
    owner,
    repo,
    namespace: ctx.workloadNamespace,
    site,
    builderImage: builderImg!,
    sourceBinder: binder,
  });
  const buildJob = await batchAPI.createNamespacedJob(
    ctx.workloadNamespace,
    job,
  ).catch(ignoreIfExists);

  if (buildJob?.response?.statusCode && buildJob.response.statusCode >= 400) {
    badRequest({ message: "could not build" });
  }
  const statusFn = getBuildStatus(performance.now());
  const getBuildStatusFn = () =>
    statusFn(batchAPI, ctx.workloadNamespace, job.metadata!.name!);
  return {
    sourceBinder: binder,
    waitUntil: waitWithPooling(getBuildStatusFn, 5_000),
    getBuildStatus: getBuildStatusFn,
  };
}
