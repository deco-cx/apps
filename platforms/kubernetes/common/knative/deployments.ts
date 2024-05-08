import { SrcBinder } from "../../actions/build.ts";
import { Routes } from "../../actions/deployments/rollout.ts";
import { k8s } from "../../deps.ts";
import { SiteState, Source } from "../../loaders/siteState/get.ts";
import { AppContext, CONTROL_PLANE_DOMAIN } from "../../mod.ts";
import { assertsOrBadRequest } from "../assertions.ts";
import { ignoreIfExists, upsertObject } from "../objects.ts";
import { revisionRoute, waitToBeReady } from "./route.ts";
import { knativeServiceOf } from "./service.ts";

export interface DeployOptions {
  source: Source;
  build?: boolean;
  siteState: SiteState;
  site: string;
  siteNs: string;
  deploymentId: string;
  deploymentSlug?: string;
  labels?: Record<string, string>;
  runnerImage: string;
  hypervisor?: boolean;
}

const IMMUTABLE_ANNOTATIONS = ["serving.knative.dev/creator"];

interface DeployServiceOptions {
  service: ReturnType<typeof knativeServiceOf>;
  site: string;
  deploymentId: string;
  deploymentSlug?: string;
  siteNs: string;
  revisionName: string;
  k8sApi: k8s.CustomObjectsApi;
}
const deployService = async (
  { service, site, siteNs, deploymentId, deploymentSlug, revisionName }:
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

  const domains: { url: string; production: boolean }[] = [];

  const deploymentSlugRev = deploymentSlug
    ? Routes.slug(site, deploymentSlug)
    : undefined;

  const deploymentSlugRoute = deploymentSlugRev
    ? {
      routeName: deploymentSlugRev,
      revisionName,
      namespace: siteNs,
    }
    : undefined;

  const slugRoute = deploymentSlugRoute
    ? upsertObject(
      ctx.kc,
      revisionRoute(deploymentSlugRoute),
      "serving.knative.dev",
      "v1",
      "routes",
    ).then(async () => {
      await waitToBeReady(ctx.kc, deploymentSlugRoute);

      return {
        url: `https://${deploymentSlugRev}.${CONTROL_PLANE_DOMAIN}`,
        production: false,
      };
    })
    : Promise.resolve(undefined);

  await slugRoute.then((domain) => {
    domain && domains.push(domain);
  });

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
    runnerImage,
    hypervisor,
    deploymentSlug,
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
    scaling: siteState.scaling!,
    runnerImage,
    revisionName,
    serviceAccountName: siteState?.useServiceAccount ? `site-sa` : undefined,
    runArgs: siteState?.runArgs,
    resources: siteState.resources!,
    nodeAffinity: siteState.nodeAffinity,
    nodeSelector: siteState.nodeSelector,
    volumeMounts: siteState.volumeMounts,
    volumes: siteState.volumes,
    hypervisor,
  });

  return deployService({
    service,
    site,
    deploymentSlug,
    deploymentId,
    siteNs,
    revisionName,
    k8sApi,
  }, ctx);
};
