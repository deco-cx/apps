import { badRequest } from "deco/mod.ts";
import { k8s } from "../../deps.ts";
import { hashString } from "../../hash/shortHash.ts";
import { upsertObject } from "../../k8s/objects.ts";
import { ServiceScaling, SiteState } from "../../loaders/k8s/siteState.ts";
import { AppContext } from "../../mod.ts";
import { SourceBinder, SrcBinder } from "../k8s/build.ts";

const hashScaling = (svcScaling?: ServiceScaling) =>
  `${svcScaling?.initialScale}-${svcScaling?.maxScale}-${svcScaling?.minScale}`;
export const DeploymentId = {
  build: (
    {
      commitSha,
      release,
      owner,
      repo,
      runnerImage,
      envVars,
      scaling,
      useServiceAccount,
    }: SiteState,
  ) =>
    hashString(
      `${commitSha}-${release}-${owner}-${repo}-${runnerImage}-${
        (envVars ?? []).map((e) => `${e.name}:${e.value}`).join(",")
      }-${hashScaling(scaling?.preview)}-${
        hashScaling(scaling?.production)
      }-${useServiceAccount}`,
    ),
};

export interface Props {
  site: string;
  production: boolean;
  deploymentId: string;
  runnerImage?: string;
  siteState: SiteState;
}

export interface EnvVar {
  name: string;
  value: string;
}

interface KnativeSerivceOpts {
  revisionName: string;
  site: string;
  namespace: string;
  deploymentId: string;
  production: boolean;
  scaling: ServiceScaling;
  runnerImage: string;
  sourceBinder: SourceBinder;
  envVars?: EnvVar[];
  serviceAccountName?: string;
}
const knativeServiceOf = (
  {
    site,
    namespace,
    deploymentId,
    production,
    scaling: { initialScale, maxScale, minScale },
    runnerImage,
    revisionName,
    sourceBinder,
    envVars,
    serviceAccountName,
  }: KnativeSerivceOpts,
) => {
  return {
    apiVersion: "serving.knative.dev/v1",
    kind: "Service",
    metadata: {
      name: `${site}-site`,
      namespace,
      annotations: {
        "networking.knative.dev/wildcardDomain": "*.decocdn.com",
      },
      labels: {
        prod: production ? "true" : "false",
      },
    },
    spec: {
      template: {
        metadata: {
          name: revisionName,
          annotations: {
            "autoscaling.knative.dev/initial-scale": `${initialScale}`,
            "autoscaling.knative.dev/max-scale": `${maxScale}`,
            "autoscaling.knative.dev/min-scale": `${minScale}`,
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
              envFrom: [
                {
                  configMapRef: {
                    name: "workload-default-env",
                  },
                },
              ],
              env: [
                { name: "DECO_SITE_NAME", value: site },
                {
                  name: "DENO_DEPLOYMENT_ID",
                  value: deploymentId,
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

interface RouteOpts {
  namespace: string;
  routeName: string;
  revisionName: string;
}
const routeOf = ({ namespace, routeName: name, revisionName }: RouteOpts) => {
  return {
    apiVersion: "serving.knative.dev/v1",
    kind: "Route",
    metadata: {
      name,
      namespace,
    },
    spec: {
      traffic: [
        {
          revisionName,
          percent: 100, // All traffic goes to this revision
        },
      ],
    },
  };
};
export default async function newService(
  { production, site, deploymentId, runnerImage, siteState }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { loaders } = ctx.invoke["deco-sites/admin"];

  const runnerImg = siteState?.runnerImage ?? runnerImage ??
    (await loaders.k8s.runnerConfig().then((b) => b.image));
  const k8sApi = ctx.kc.makeApiClient(k8s.CustomObjectsApi);
  const revisionName = `${site}-site-${deploymentId}`;

  const service = knativeServiceOf({
    envVars: siteState.envVars,
    sourceBinder: SrcBinder.fromRepo(
      siteState.owner,
      siteState.repo,
      siteState.commitSha,
    ),
    site,
    namespace: ctx.workloadNamespace,
    deploymentId,
    production,
    scaling: (production
      ? siteState?.scaling?.production
      : siteState?.scaling?.preview) ??
      { initialScale: 0, maxScale: 3, minScale: 0 },
    runnerImage: runnerImg!,
    revisionName,
    serviceAccountName: siteState?.useServiceAccount ? `${site}-sa` : undefined,
  });
  const createdKnativeService = await upsertObject(
    ctx.kc,
    service,
    "serving.knative.dev",
    "v1",
    "services",
  );

  if (
    createdKnativeService.response.statusCode &&
    createdKnativeService.response.statusCode >= 400
  ) {
    badRequest({ message: "could not create knative service" });
  }

  const deploymentRoute = `sites-${site}-${deploymentId}`;
  const routes: Promise<{ response: { statusCode?: number } }>[] = [
    k8sApi.createNamespacedCustomObject(
      "serving.knative.dev",
      "v1",
      ctx.workloadNamespace,
      "routes",
      routeOf({
        routeName: deploymentRoute,
        revisionName,
        namespace: ctx.workloadNamespace,
      }),
    ),
  ];

  if (production) {
    routes.push(
      upsertObject(
        ctx.kc,
        routeOf({
          routeName: `sites-${site}`,
          revisionName,
          namespace: ctx.workloadNamespace,
        }),
        "serving.knative.dev",
        "v1",
        "routes",
      ),
    );
  }

  const routeResponses = await Promise.all(
    routes,
  );

  if (
    routeResponses.some((routeResp) =>
      routeResp.response.statusCode && routeResp.response.statusCode >= 400
    )
  ) {
    badRequest({ message: "error when trying to create routes" });
  }
}
