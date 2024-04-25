import { revisionRoute } from "../../common/knative/route.ts";
import { upsertObject } from "../../common/objects.ts";
import { AppContext } from "../../mod.ts";
import { Namespace } from "../sites/create.ts";
import { k8s } from "../../deps.ts";
import { logger } from "deco/observability/otel/config.ts";
import { revisions, routes, servingKnativeDev, v1 } from "./constants.ts";

export interface Props {
  site: string;
  deploymentId: string;
}

export interface MinPodsProps {
  k8sApi: k8s.CustomObjectsApi;
  site: string;
  oldRevision: any;
}

export const Routes = {
  prod: (site: string) => `sites-${site}`,
  preview: (site: string, deploymentId: string) =>
    `${Routes.prod(site)}-${deploymentId}`,
};

const getOldProdRevisionBody = async ({
  k8sApi,
  site,
  oldRevision,
}: MinPodsProps) => {
  const oldProdRevision = await k8sApi
    .getNamespacedCustomObject(
      servingKnativeDev,
      v1,
      Namespace.forSite(site),
      revisions,
      oldRevision,
    )
    .catch((err) => {
      logger.error(err);
    });

  if (!oldProdRevision) {
    logger.error(
      "It was not possible to find the old production pod revision!",
    );
    return;
  }

  const oldProdRevisionBody = oldProdRevision.body;
  oldProdRevisionBody.metadata.annotations[
    "autoscaling.knative.dev/min-scale"
  ] = "0";

  return oldProdRevisionBody;
};

const getCurrentProdRevision = async ({
  k8sApi,
  site,
}: {
  k8sApi: k8s.CustomObjectsApi;
  site: string;
}) => {
  const currentProdRevision = await k8sApi
    .getNamespacedCustomObject(
      servingKnativeDev,
      v1,
      Namespace.forSite(site),
      routes,
      Routes.prod(site),
    )
    .catch((err) => {
      logger.error(err);
    });
  return currentProdRevision;
};

/**
 * Rollout an specific deployment to production without promotion(next pushes will take changes back in prod).
 * @title Deployment Rollout
 */
export default async function rollout(
  { site, deploymentId }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const k8sApi = ctx.kc.makeApiClient(k8s.CustomObjectsApi);

  const currentProdRevision = await getCurrentProdRevision({ k8sApi, site });

  const oldRevision = currentProdRevision?.body.spec.traffic[0].revisionName;

  const revisionName = `${site}-site-${deploymentId}`;

  await upsertObject(
    ctx.kc,
    revisionRoute({
      routeName: Routes.prod(site),
      revisionName,
      namespace: Namespace.forSite(site),
    }),
    servingKnativeDev,
    v1,
    routes,
  );

  const oldProdRevisionBody = await getOldProdRevisionBody({
    k8sApi,
    site,
    oldRevision,
  });

  if (!oldProdRevisionBody) {
    return;
  }

  await upsertObject(
    ctx.kc,
    oldProdRevisionBody,
    servingKnativeDev,
    v1,
    revisions,
  );
}
