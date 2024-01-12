import { badRequest } from "deco/mod.ts";
import buildScript from "../common/cmds/build.ts";
import { watchJobStatus } from "../common/jobs.ts";
import { ignoreIfExists } from "../common/objects.ts";
import { k8s } from "../deps.ts";
import { hashString } from "../hash/shortHash.ts";
import { AppContext } from "../mod.ts";
import { Namespace } from "./sites/create.ts";

export interface Props {
  site: string;
  commitSha: string;
  repo: string;
  owner: string;
  builderImage?: string;
}

export const DECO_SITES_PVC = "deco-sites-sources";
interface BuildJobOpts {
  githubToken?: string;
  name: string;
  commitSha: string;
  repo: string;
  owner: string;
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
    githubToken,
    name,
    commitSha,
    repo,
    owner,
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
      namespace: Namespace.forSite(site),
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
              command: ["/bin/sh", "-c"],
              args: [buildScript],
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
                  name: "GITHUB_TOKEN",
                  ...githubToken ? { value: githubToken } : {
                    valueFrom: {
                      secretKeyRef: {
                        name: "github-token",
                        key: "token",
                      },
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
 * Returns running if job is not found or job status is not defined or succeed / failed depending on the Complete condition.
 */
const buildStatusOf = (job: k8s.V1Job | null): BuildStatus => {
  if (!job) {
    return "running" as const;
  }
  const jobStatus = job.status;
  if (!jobStatus) {
    return "running" as const;
  }

  const condition = (jobStatus.conditions ?? []).find((
    cond: k8s.V1JobCondition,
  ) => cond.status === "True");
  if (!condition) {
    return "running" as const;
  }

  return condition.type === "Complete" ? "succeed" : "failed";
};

/**
 * Fetches the job and gets the build status based on the job condition.
 */
const getBuildStatus = async (
  api: k8s.BatchV1Api,
  namespace: string,
  jobName: string,
): Promise<BuildStatus> => {
  const job = await api.readNamespacedJob(jobName, namespace);
  return buildStatusOf(job.body);
};

export type BuildStatus =
  | "succeed"
  | "failed"
  | "running";

export interface BuildResult {
  sourceBinder: SourceBinder;
  getBuildStatus: () => Promise<BuildStatus>;
  wait: (timeoutMs?: number) => Promise<BuildStatus>;
}

/**
 * Builds a specific commit repo and owner using the given builder image or getting from builder image default.
 */
export default async function build(
  { commitSha, repo, owner, site, builderImage }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BuildResult> {
  const builderImg = builderImage;
  if (!builderImg) {
    badRequest({ message: "builder image is required" });
  }
  const batchAPI = ctx.kc.makeApiClient(k8s.BatchV1Api);
  const binder = SrcBinder.fromRepo(owner, repo, commitSha);
  // Define the Job specification
  const jobName = `build-${await hashString(
    `build-${commitSha}-${owner}-${repo}`,
  )}`;
  const job = buildJobOf({
    name: jobName,
    githubToken: ctx.githubToken,
    commitSha,
    owner,
    repo,
    site,
    builderImage: builderImg!,
    sourceBinder: binder,
  });

  await batchAPI.createNamespacedJob(
    site,
    job,
  ).catch(ignoreIfExists);

  const getBuildStatusFn = () =>
    getBuildStatus(batchAPI, site, job.metadata!.name!);
  return {
    sourceBinder: binder,
    wait: (timeout?: number) =>
      watchJobStatus(ctx.kc, site, jobName, timeout).then(buildStatusOf).catch(
        () => {
          return "running" as const;
        },
      ),
    getBuildStatus: getBuildStatusFn,
  };
}
