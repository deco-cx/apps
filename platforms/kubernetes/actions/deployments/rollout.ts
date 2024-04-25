import { revisionRoute } from "../../common/knative/route.ts";
import { upsertObject } from "../../common/objects.ts";
import { AppContext } from "../../mod.ts";
import { Namespace } from "../sites/create.ts";
import { k8s } from "../../deps.ts";
import { logger } from "deco/observability/otel/config.ts";
import {
  PLURAL_REVISIONS,
  PLURAL_ROUTES,
  GROUP_SERVINGKNATIVEDEV,
  VERSION_V1,
} from "../../constants.ts";

export interface Props {
  site: string;
  deploymentId: string;
}

export interface MinPodsProps {
  k8sApi: k8s.CustomObjectsApi;
  site: string;
  oldRevision: string;
}

export interface UpdateRevision {
  ctx: AppContext;
  site: string;
  oldRevision: string;
}

export const Routes = {
  prod: (site: string) => `sites-${site}`,
  preview: (site: string, deploymentId: string) =>
    `${Routes.prod(site)}-${deploymentId}`,
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
      GROUP_SERVINGKNATIVEDEV,
      VERSION_V1,
      Namespace.forSite(site),
      PLURAL_ROUTES,
      Routes.prod(site)
    )
    .catch((err) => {
      logger.error(err);
    });
  return currentProdRevision;
};

const updtadeOldRevision = async ({
  oldRevision,
  site,
  ctx,
}: UpdateRevision) => {
  const oldProdRevisionBody = {
    metadata: {
      name: oldRevision,
      namespace: Namespace.forSite(site),
    },
  };

  if (!oldProdRevisionBody) {
    return;
  }

  await upsertObject(
    ctx.kc,
    oldProdRevisionBody,
    GROUP_SERVINGKNATIVEDEV,
    VERSION_V1,
    PLURAL_REVISIONS,
    (current) => {
      return {
        ...current,
        metadata: {
          ...current.metadata,
          annotations: {
            ...current.metadata.annotations,
            "autoscaling.knative.dev/min-scale": "0",
          },
        },
      };
    }
  );
};

/**
 * Rollout an specific deployment to production without promotion(next pushes will take changes back in prod).
 * @title Deployment Rollout
 */
export default async function rollout(
  { site, deploymentId }: Props,
  _req: Request,
  ctx: AppContext
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
    GROUP_SERVINGKNATIVEDEV,
    VERSION_V1,
    PLURAL_ROUTES
  );

  await updtadeOldRevision({ oldRevision, site, ctx });
}
