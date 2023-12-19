import { badRequest } from "deco/mod.ts";
import { k8s } from "../../deps.ts";
import { watchJobStatus } from "../../k8s/jobs.ts";
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
  commitSha: string;
  repo: string;
  owner: string;
  namespace: string;
  site: string;
  builderImage: string;
  githubToken?: string;
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
    commitSha,
    repo,
    owner,
    namespace,
    site,
    builderImage,
    githubToken,
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
      name: `${commitSha}-${owner}-${repo}`,
      namespace,
    },
    spec: {
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
              command: ["sh", "/bootstrap.sh"],
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
                  value: githubToken,
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

export default async function build(
  { commitSha, repo, owner, site, builderImage }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { loaders } = ctx.invoke["deco-sites/admin"];
  const builderImg = builderImage ??
    (await loaders.k8s.builderConfig().then((b) => b.image));
  const batchAPI = ctx.kc.makeApiClient(k8s.BatchV1Api);
  const binder = SrcBinder.fromRepo(owner, repo, commitSha);
  // Define the Job specification
  const job = buildJobOf({
    commitSha,
    owner,
    repo,
    namespace: ctx.workloadNamespace,
    site,
    builderImage: builderImg!,
    githubToken: ctx.githubWebhookSecret,
    sourceBinder: binder,
  });
  const buildJob = await batchAPI.createNamespacedJob(
    ctx.workloadNamespace,
    job,
  );
  if (buildJob.response.statusCode && buildJob.response.statusCode >= 400) {
    badRequest({ message: "could not create knative service" });
  }
  await watchJobStatus(ctx.kc, ctx.workloadNamespace, job.metadata?.name!);
  return binder;
}
