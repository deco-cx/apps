import { shortcircuit } from "deco/engine/errors.ts";
import { SrcBinder } from "../../actions/build.ts";
import { Routes } from "../../actions/deployments/rollout.ts";
import { k8s } from "../../deps.ts";
import {
  ServiceScaling,
  SiteState,
  Source,
} from "../../loaders/siteState/get.ts";
import { AppContext, CONTROL_PLANE_DOMAIN } from "../../mod.ts";
import { assertsOrBadRequest } from "../assertions.ts";
import { ignoreIfExists, upsertObject } from "../objects.ts";
import { revisionRoute } from "./route.ts";
import { knativeServiceOf } from "./service.ts";

export interface DeployOptions {
  source: Source;
  build?: boolean;
  siteState: SiteState;
  site: string;
  siteNs: string;
  deploymentId: string;
  labels?: Record<string, string>;
  scaling?: ServiceScaling;
  runnerImage: string;
  production?: boolean;
}

const IMMUTABLE_ANNOTATIONS = ["serving.knative.dev/creator"];

export const ENVIRONMENT_PROD = "production";
export const ENVIRONMENT_PREVIEW = "preview";

interface DeployServiceOptions {
  service: ReturnType<typeof knativeServiceOf>;
  site: string;
  deploymentId: string;
  siteNs: string;
  revisionName: string;
  k8sApi: k8s.CustomObjectsApi;
}
const deployService = async (
  { service, site, siteNs, deploymentId, revisionName, k8sApi }:
    DeployServiceOptions,
  ctx: AppContext,
) => {
  await upsertObject(
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
  ).catch(ignoreIfExists).catch((err) => {
    console.log(JSON.stringify(err));
    throw err;
  });

  const deploymentRoute = `sites-${site}-${deploymentId}`;
  await k8sApi.createNamespacedCustomObject(
    "serving.knative.dev",
    "v1",
    siteNs,
    "routes",
    revisionRoute({
      routeName: deploymentRoute,
      revisionName,
      namespace: siteNs,
    }),
  ).catch(ignoreIfExists).catch((err) => {
    console.error("creating site route error", err);
    shortcircuit(
      new Response(
        JSON.stringify({ message: "could not create deployment route" }),
        { status: 500 },
      ),
    );
  });

  const domains = [{
    url: `https://${Routes.prod(site)}-${deploymentId}.${CONTROL_PLANE_DOMAIN}`,
    production: false,
  }];
  return { id: deploymentId, domains };
};

export const deployFromSource = async (
  {
    source,
    build,
    site,
    siteState,
    deploymentId,
    siteNs,
    labels,
    scaling,
    runnerImage,
    production,
  }: DeployOptions,
  ctx: AppContext,
) => {
  const sourceBinder = await SrcBinder.from(source, {
    ctx,
    deploymentId,
    site,
    siteNs,
  });
  if (build) {
    // when code has changed so we need to build it.
    const buildResult = await ctx.invoke.kubernetes.actions.build({
      sourceBinder,
      builderImage: siteState.builderImage,
      site,
    });
    const status = await buildResult.wait(300_000);

    assertsOrBadRequest(status === "succeed", {
      message: `unexpected build status ${status}`,
    });
  }

  const k8sApi = ctx.kc.makeApiClient(k8s.CustomObjectsApi);
  const revisionName = `${site}-site-${deploymentId}`;

  const service = knativeServiceOf({
    controlPlaneDomain: ctx.controlPlaneDomain,
    envVars: siteState.envVars,
    sourceBinder,
    site,
    namespace: siteNs,
    deploymentId,
    labels,
    scaling: scaling ?? { initialScale: 0, maxScale: 3, minScale: 0 },
    runnerImage,
    revisionName,
    serviceAccountName: siteState?.useServiceAccount ? `site-sa` : undefined,
    runArgs: siteState?.runArgs,
    resources: siteState?.resources ??
      { requests: { memory: "768Mi" }, limits: { memory: "1280Mi" } },
    production,
  });

  return deployService({
    service,
    site,
    deploymentId,
    siteNs,
    revisionName,
    k8sApi,
  }, ctx);
};
