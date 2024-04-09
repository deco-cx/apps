import { SourceBinder } from "../../actions/build.ts";
import runScript from "../../common/cmds/run.ts";
import {
  NodeSelector,
  ResourceRequirements,
  ServiceScaling,
} from "../../loaders/siteState/get.ts";
import { k8s } from "../../deps.ts";

export interface EnvVar {
  name: string;
  value: string;
}

export interface KnativeSerivceOpts {
  controlPlaneDomain: string;
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
  resources?: ResourceRequirements;
  runArgs?: string;
  nodeSelector?: NodeSelector;
  nodeAffinity?: k8s.V1NodeAffinity;
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

export const knativeServiceOf = (
  {
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
    resources,
    nodeSelector,
    nodeAffinity,
  }: KnativeSerivceOpts,
) => {
  return {
    apiVersion: "serving.knative.dev/v1",
    kind: "Service",
    metadata: {
      name: `${site}-site`,
      namespace,
      annotations: {
        "networking.knative.dev/wildcardDomain": `*.${controlPlaneDomain}`,
        sub: site, // subdomain of dns
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
          affinity: {
            nodeAffinity,
          },
          nodeSelector,
          serviceAccountName,
          volumes: sourceBinder.volumes,
          containers: [
            {
              name: "app",
              command: ["/bin/sh", "-c"],
              args: [runScript],
              resources,
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
                ...sourceBinder.cacheOutput
                  ? [{
                    name: "CACHE_PATH",
                    value: sourceBinder.cacheOutput,
                  }]
                  : [],
                {
                  name: "SOURCE_ASSET_PATH",
                  value: sourceBinder.sourceOutput,
                },
                { name: "APP_PORT", value: "8000" },
                ...envVars ?? [],
                // Add other environment variables as needed
              ],
              image: runnerImage,
              volumeMounts: sourceBinder.volumeMounts,
              ports: [{ name: "http1", containerPort: 8000 }],
            },
          ],
        },
      },
    },
  };
};
