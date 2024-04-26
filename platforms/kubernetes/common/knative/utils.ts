import { upsertObject } from "../../common/objects.ts";
import { AppContext } from "../../mod.ts";
import { Namespace } from "../../actions/sites/create.ts";
import {
  PLURAL_REVISIONS,
  GROUP_SERVINGKNATIVEDEV,
  VERSION_V1,
  PLURAL_ROUTES,
} from "../../constants.ts";
import { Routes } from "../../actions/deployments/rollout.ts";
import { logger } from "deco/observability/otel/config.ts";
import { k8s } from "../../deps.ts";

export interface UpdateRevision {
  ctx: AppContext;
  site: string;
  revision: string;
}

export const allowScaleToZero = async ({
  revision,
  site,
  ctx,
}: UpdateRevision) => {
  const revisionBody = {
    metadata: {
      name: revision,
      namespace: Namespace.forSite(site),
    },
  };

  if (!revisionBody) {
    return;
  }

  await upsertObject(
    ctx.kc,
    revisionBody,
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

export const getProdRevision = async ({
  k8sApi,
  site,
}: {
  k8sApi: k8s.CustomObjectsApi;
  site: string;
}) => {
  const prodRevision = await k8sApi
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
  return prodRevision;
};
