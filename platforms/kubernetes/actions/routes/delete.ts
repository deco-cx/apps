import { logger } from "deco/mod.ts";
import {
  GROUP_SERVING_KNATIVE_DEV,
  PLURAL_ROUTES,
  VERSION_V1,
} from "../../constants.ts";
import { k8s } from "../../deps.ts";
import { AppContext } from "../../mod.ts";
import { Routes } from "../deployments/rollout.ts";
import { Namespace } from "../sites/create.ts";

export interface Props {
  site: string;
  slug: string;
}

/**
 * Rollout an specific deployment to production without promotion(next pushes will take changes back in prod).
 * @title Deployment Rollout
 */
export default async function deleteRoute(
  { site, slug }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const k8sApi = ctx.kc.makeApiClient(k8s.CustomObjectsApi);
  await k8sApi.deleteNamespacedCustomObject(
    GROUP_SERVING_KNATIVE_DEV,
    VERSION_V1,
    Namespace.forSite(site),
    PLURAL_ROUTES,
    Routes.slug(site, slug),
  ).catch((err) => {
    logger.error(
      `Error when deleting route ${slug} ${err?.message}`,
    );
    // ignore
  });
}
