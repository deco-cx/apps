import { RouteBody, upsertObject } from "../objects.ts";
import { AppContext } from "../../mod.ts";
import { Namespace } from "../../actions/sites/create.ts";
import {
  GROUP_SERVING_KNATIVE_DEV,
  PLURAL_REVISIONS,
  PLURAL_ROUTES,
  VERSION_V1,
} from "../../constants.ts";
import { Routes } from "../../actions/deployments/rollout.ts";
import { logger } from "deco/observability/otel/config.ts";
import { k8s } from "../../deps.ts";

export interface UpdateRevision {
  ctx: AppContext;
  site: string;
  revisionName: string | undefined;
}

export const allowScaleToZero = async ({
  revisionName,
  site,
  ctx,
}: UpdateRevision) => {
  if (!revisionName) {
    return;
  }
  const revision = {
    metadata: {
      name: revisionName,
      namespace: Namespace.forSite(site),
    },
  };

  await upsertObject(
    ctx.kc,
    revision,
    GROUP_SERVING_KNATIVE_DEV,
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
    },
  );
};

export const getProdRevisionName = async ({
  k8sApi,
  site,
}: {
  k8sApi: k8s.CustomObjectsApi;
  site: string;
}): Promise<string | undefined> => {
  const prodRoute = await k8sApi
    .getNamespacedCustomObject(
      GROUP_SERVING_KNATIVE_DEV,
      VERSION_V1,
      Namespace.forSite(site),
      PLURAL_ROUTES,
      Routes.prod(site),
    )
    .catch((err) => {
      logger.error(err);
    });
  const routeBody = prodRoute?.body as RouteBody;
  return routeBody?.spec.traffic[0].revisionName;
};
