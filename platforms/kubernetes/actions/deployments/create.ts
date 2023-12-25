import { badRequest } from "deco/mod.ts";
import ShortUniqueId from "https://esm.sh/short-unique-id@v4.4.2";
import runScript from "../../common/cmds/run.ts";
import { routeOf } from "../../common/knative/route.ts";
import { ignoreIfExists, upsertObject } from "../../common/objects.ts";
import { k8s } from "../../deps.ts";
import { ServiceScaling, SiteState } from "../../loaders/siteState/get.ts";
import { AppContext } from "../../mod.ts";
import { SourceBinder, SrcBinder } from "../build.ts";

const uid = new ShortUniqueId({ length: 10, dictionary: "alpha_lower" });
export const DeploymentId = {
  new: () => uid.randomUUID(),
};

export interface Props {
  site: string;
  scaling?: ServiceScaling;
  labels?: Record<string, string>;
  deploymentId: string;
  runnerImage?: string;
  siteState: SiteState;
}

export interface EnvVar {
  name: string;
  value: string;
}

interface KnativeSerivceOpts {
  controlPlaneDomain: string;
  cachePath: string;
  revisionName: string;
  site: string;
  namespace: string;
  deploymentId: string;
  labels?: Record<string, string>;
  scaling: ServiceScaling;
  runnerImage: string;
  sourceBinder: SourceBinder;
  envVars?: EnvVar[];
  serviceAccountName?: string;
  runArgs?: string;
}

const typeToAttributes: Record<
  Required<ServiceScaling>["metric"]["type"],
  (metric: Required<ServiceScaling>["metric"]) => Record<string, string>
> = {
  concurrency: (metric) => {
    return {
      "autoscaling.knative.dev/metric": "concurrency",
      "autoscaling.knative.dev/target-utilization-percentage":
        `${metric.target}`,
    };
  },
  cpu: (metric) => {
    return {
      "autoscaling.knative.dev/class": "hpa.autoscaling.knative.dev",
      "autoscaling.knative.dev/metric": "cpu",
      "autoscaling.knative.dev/target": `${metric.target}`,
    };
  },
  memory: (metric) => {
    return {
      "autoscaling.knative.dev/class": "hpa.autoscaling.knative.dev",
      "autoscaling.knative.dev/metric": "concurrency",
      "autoscaling.knative.dev/target": `${metric.target}`,
    };
  },
  rps: (metric) => {
    return {
      "autoscaling.knative.dev/metric": "rps",
      "autoscaling.knative.dev/target": `${metric.target}`,
    };
  },
};

const metricToAnnotations = (
  metric: ServiceScaling["metric"],
): Record<string, string> => {
  if (!metric) {
    return {};
  }
  return typeToAttributes[metric.type](metric);
};

const knativeServiceOf = (
  {
    cachePath,
    runArgs,
    site,
    namespace,
    deploymentId,
    labels,
    scaling: { initialScale, maxScale, minScale, retentionPeriod, metric },
    runnerImage,
    revisionName,
    sourceBinder,
    envVars,
    serviceAccountName,
    controlPlaneDomain,
  }: KnativeSerivceOpts,
) => {
  return {
    apiVersion: "serving.knative.dev/v1",
    kind: "Service",
    metadata: {
      name: `sites`,
      namespace,
      annotations: {
        "networking.knative.dev/wildcardDomain": `*.${controlPlaneDomain}`,
      },
      labels,
    },
    spec: {
      template: {
        metadata: {
          name: revisionName,
          annotations: {
            ...metricToAnnotations(metric),
            "autoscaling.knative.dev/initial-scale": `${initialScale ?? 0}`,
            "autoscaling.knative.dev/max-scale": `${maxScale ?? 0}`,
            "autoscaling.knative.dev/min-scale": `${minScale ?? 0}`,
            "autoscaling.knative.dev/scale-to-zero-pod-retention-period": `${
              retentionPeriod ?? "0s"
            }`,
          },
        },
        spec: {
          serviceAccountName,
          volumes: [
            {
              name: "assets",
              persistentVolumeClaim: {
                claimName: sourceBinder.claimName,
              },
            },
            {
              name: "code",
              emptyDir: {},
            },
          ],
          containers: [
            {
              name: "app",
              command: ["/bin/sh", "-c"],
              args: [runScript],
              // TODO Inject default environment variables (e.g. OTEL_* configs)
              // envFrom: [
              //   {
              //     configMapRef: {
              //       name: "workload-default-env",
              //     },
              //   },
              // ],
              env: [
                {
                  name: "ASSETS_MOUNT_PATH",
                  value: sourceBinder.mountPath,
                },
                { name: "EXTRA_RUN_ARGS", value: runArgs },
                { name: "DECO_SITE_NAME", value: site },
                {
                  name: "DENO_DEPLOYMENT_ID",
                  value: deploymentId,
                },
                {
                  name: "CACHE_PATH",
                  value: cachePath,
                },
                {
                  name: "SOURCE_ASSET_PATH",
                  value: sourceBinder.sourcePath,
                },
                { name: "APP_PORT", value: "8000" },
                ...envVars ?? [],
                // Add other environment variables as needed
              ],
              image: runnerImage,
              volumeMounts: [
                { name: "assets", mountPath: sourceBinder.mountPath },
                { name: "code", mountPath: "/app/deco" },
              ],
              ports: [{ name: "http1", containerPort: 8000 }],
            },
          ],
        },
      },
    },
  };
};

const IMMUTABLE_ANNOTATIONS = ["serving.knative.dev/creator"];

/**
 * Creates a new Knative Service and the route that points to it.
 * @title Create k8s Deployment
 */
export default async function newDeployment(
  {
    site,
    deploymentId,
    labels,
    runnerImage,
    siteState,
    siteState: { source },
    scaling = { initialScale: 0, maxScale: 3, minScale: 0 },
  }: Props,
  _req: Request,
  ctx: AppContext,
) {
  if (!source) {
    badRequest({ message: "source is required" });
    return;
  }
  const { owner, repo, commitSha } = source;
  const runnerImg = runnerImage ?? siteState?.runnerImage;
  if (!runnerImg) {
    badRequest({ message: "runner image is required" });
    return;
  }
  const k8sApi = ctx.kc.makeApiClient(k8s.CustomObjectsApi);
  const revisionName = `sites-${deploymentId}`;

  const sourceBinder = SrcBinder.fromRepo(
    owner,
    repo,
    commitSha,
  );
  const service = knativeServiceOf({
    controlPlaneDomain: ctx.controlPlaneDomain,
    cachePath: `${sourceBinder.mountPath}/${owner}/${repo}/cache.tar`,
    envVars: siteState.envVars,
    sourceBinder,
    site,
    namespace: site,
    deploymentId,
    labels,
    scaling,
    runnerImage: runnerImg!,
    revisionName,
    serviceAccountName: siteState?.useServiceAccount ? `site-sa` : undefined,
    runArgs: siteState?.runArgs,
  });
  const createdKnativeService = await upsertObject(
    ctx.kc,
    service,
    "serving.knative.dev",
    "v1",
    "services",
    (current) => {
      return {
        ...service,
        metadata: {
          ...current.metadata,
          ...service.metadata,
          annotations: {
            ...current.metadata.annotations,
            ...service.metadata.annotations,
            ...IMMUTABLE_ANNOTATIONS.reduce((acc, key) => {
              if (current.metadata.annotations?.[key]) {
                acc[key] = current.metadata.annotations[key];
              }
              return acc;
            }, {} as Record<string, string>),
          },
        },
      };
    },
  );

  if (
    createdKnativeService.response.statusCode &&
    createdKnativeService.response.statusCode >= 400
  ) {
    badRequest({ message: "could not create knative service" });
  }

  const deploymentRoute = `${deploymentId}-sites`;
  await k8sApi.createNamespacedCustomObject(
    "serving.knative.dev",
    "v1",
    site,
    "routes",
    routeOf({
      routeName: deploymentRoute,
      revisionName,
      namespace: site,
    }),
  ).catch(ignoreIfExists);
}
