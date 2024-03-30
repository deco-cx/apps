import { badRequest } from "deco/mod.ts";
import { walk } from "../../../files/sdk.ts";
import buildScript from "../common/cmds/build.ts";
import { watchJobStatus } from "../common/jobs.ts";
import { ignoreIfExists } from "../common/objects.ts";
import { k8s } from "../deps.ts";
import { hashString } from "../hash/shortHash.ts";
import {
  Files,
  Github,
  Source,
  sourceIsFromFiles,
} from "../loaders/siteState/get.ts";
import { AppContext } from "../mod.ts";
import { Namespace } from "./sites/create.ts";

export interface Props {
  site: string;
  sourceBinder: SourceBinder;
  builderImage?: string;
}

const CACHE_FILE = "cache.tar";
export const DECO_SITES_PVC = "deco-sites-sources";
const START_CACHE = `deco-sites/start/${CACHE_FILE}`;

interface BuildJobOpts {
  name: string;
  site: string;
  builderImage: string;
  sourceBinder: SourceBinder;
}

export interface VolumeBinder {
  claimName: string;
  mountPath: string;
  sourcePath: string;
}
export interface SourceBinder {
  envVars: k8s.V1EnvVar[];
  volumes: k8s.V1Volume[];
  volumeMounts: k8s.V1VolumeMount[];
  labels?: Record<string, string>;
  mountPath: string;
  sourceOutput: string;
  cacheOutput?: string;
  sourceId: string;
}

export interface BinderOptions {
  ctx: AppContext;
  deploymentId: string;
  site: string;
  siteNs: string;
}
const ASSETS_VOLUME_NAME = "assets";
const SOURCE_LOCAL_NAME = "source-local";
export const SOURCE_LOCAL_MOUNT_PATH = "/app/deco";

export const SrcBinder = {
  from: (
    source: Source,
    opts: BinderOptions,
  ): Promise<SourceBinder> => {
    const { ctx } = opts;
    if (!sourceIsFromFiles(source)) {
      return Promise.resolve(SrcBinder.fromGithub(
        source,
        ctx.githubToken,
      ));
    }
    return SrcBinder.fromFiles(source, opts);
  },
  fromFiles: async (
    { files }: Files,
    { deploymentId, site, siteNs, ctx }: BinderOptions,
  ): Promise<SourceBinder> => {
    const FILES_VOLUME_NAME = "app-files";
    const FILES_MOUNT_PATH = "/etc/app-files";
    const configMapName = `files-${deploymentId}`;
    const k8sApi = ctx.kc.makeApiClient(k8s.CoreV1Api);
    const data: Record<string, string> = {};
    const items: Array<{ key: string; path: string }> = [];

    for (const file of walk(files)) {
      const path = file.path.slice(1);
      const key = path.replaceAll("/", "_");
      data[key] = file.content;
      items.push({ path, key });
    }

    await k8sApi.createNamespacedConfigMap(siteNs, {
      apiVersion: "v1",
      kind: "ConfigMap",
      metadata: {
        name: configMapName,
        namespace: siteNs,
      },
      data,
    }).catch((err) => {
      console.log(JSON.stringify(err));
      throw err;
    });

    const mountPath = `/${DECO_SITES_PVC}`;
    const owner = "deco-sites-files";
    const repo = site;

    return {
      sourceId: deploymentId,
      labels: {},
      volumes: [{
        name: ASSETS_VOLUME_NAME,
        persistentVolumeClaim: {
          claimName: DECO_SITES_PVC,
        },
      }, {
        name: SOURCE_LOCAL_NAME,
        emptyDir: {},
      }, {
        name: FILES_VOLUME_NAME,
        configMap: {
          name: configMapName,
          items,
        },
      }],
      volumeMounts: [{
        name: ASSETS_VOLUME_NAME,
        mountPath,
      }, {
        name: SOURCE_LOCAL_NAME,
        mountPath: SOURCE_LOCAL_MOUNT_PATH,
      }, {
        name: FILES_VOLUME_NAME,
        mountPath: FILES_MOUNT_PATH,
      }],
      mountPath,
      cacheOutput: `${mountPath}/${owner}/${CACHE_FILE}`,
      sourceOutput: `${mountPath}/${owner}/${repo}/${deploymentId}/source.tar`,
      envVars: [
        {
          name: "SOURCE_PROVIDER",
          value: "FILES",
        },
        {
          name: "FILES_LOCAL_PATH",
          value: FILES_MOUNT_PATH,
        },
        {
          name: "SOURCE_LOCAL_DIR",
          value: SOURCE_LOCAL_MOUNT_PATH,
        },
      ],
    };
  },
  fromGithub: (
    { owner, repo, commitSha }: Github,
    githubToken?: string,
  ): SourceBinder => {
    const mountPath = `/${DECO_SITES_PVC}`;
    return {
      sourceId: `${commitSha}-${owner}-${repo}`,
      labels: {
        repo,
        owner,
      },
      envVars: [
        {
          name: "SOURCE_LOCAL_DIR",
          value: SOURCE_LOCAL_MOUNT_PATH,
        },
        {
          name: "SOURCE_PROVIDER",
          value: "GITHUB",
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
        {
          name: "GIT_REPO",
          value: `https://github.com/${owner}/${repo}`,
        },
        {
          name: "COMMIT_SHA",
          value: commitSha,
        },
      ],
      volumes: [{
        name: SOURCE_LOCAL_NAME,
        emptyDir: {},
      }, {
        name: ASSETS_VOLUME_NAME,
        persistentVolumeClaim: {
          claimName: DECO_SITES_PVC,
        },
      }],
      volumeMounts: [{
        name: SOURCE_LOCAL_NAME,
        mountPath: SOURCE_LOCAL_MOUNT_PATH,
      }, {
        name: ASSETS_VOLUME_NAME,
        mountPath,
      }],
      mountPath,
      cacheOutput: `${mountPath}/${owner}/${repo}/${CACHE_FILE}`,
      sourceOutput: `${mountPath}/${owner}/${repo}/${commitSha}/source.tar`,
    };
  },
};

const buildJobOf = (
  {
    name,
    site,
    builderImage,
    sourceBinder,
  }: BuildJobOpts,
): k8s.V1Job => {
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
        ...sourceBinder.labels ?? {},
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
            name: "esbuild-cache",
            emptyDir: {},
          }, ...sourceBinder.volumes],
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
                  name: "SOURCE_REMOTE_OUTPUT",
                  value: sourceBinder.sourceOutput,
                },
                {
                  name: "CACHE_REMOTE_OUTPUT",
                  value: sourceBinder.cacheOutput,
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
                  name: "BUILD_CACHE_FALLBACK",
                  value: `${sourceBinder.mountPath}/${START_CACHE}`,
                },
                ...sourceBinder.envVars,
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
                ...sourceBinder.volumeMounts,
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
  { sourceBinder: binder, site, builderImage }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BuildResult> {
  const builderImg = builderImage;
  if (!builderImg) {
    badRequest({ message: "builder image is required" });
  }
  const siteNs = Namespace.forSite(site);
  const batchAPI = ctx.kc.makeApiClient(k8s.BatchV1Api);
  // Define the Job specification
  const jobName = `build-${await hashString(
    `build-${binder.sourceId}`,
  )}`;
  const job = buildJobOf({
    name: jobName,
    site,
    builderImage: builderImg!,
    sourceBinder: binder,
  });

  await batchAPI.createNamespacedJob(
    siteNs,
    job,
  ).catch(ignoreIfExists);

  const getBuildStatusFn = () =>
    getBuildStatus(batchAPI, siteNs, job.metadata!.name!);
  return {
    sourceBinder: binder,
    wait: (timeout?: number) =>
      watchJobStatus(ctx.kc, siteNs, jobName, timeout).then(buildStatusOf)
        .catch(
          () => {
            return "running" as const;
          },
        ),
    getBuildStatus: getBuildStatusFn,
  };
}
