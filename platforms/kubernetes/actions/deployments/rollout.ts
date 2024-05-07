import { revisionRoute } from "../../common/knative/route.ts";
import { upsertObject } from "../../common/objects.ts";
import { AppContext } from "../../mod.ts";
import { Namespace } from "../sites/create.ts";
import { k8s } from "../../deps.ts";

import {
  GROUP_SERVING_KNATIVE_DEV,
  PLURAL_ROUTES,
  VERSION_V1,
} from "../../constants.ts";
import {
  allowScaleToZero,
  getProdRevisionName,
} from "../../common/knative/revisions.ts";

export interface Props {
  site: string;
  deploymentId: string;
}

export const Routes = {
  prod: (site: string) => `sites-${site}`,
  slug: (site: string, slug: string) => `${Routes.prod(site)}-${slug}`,
  preview: (site: string, deploymentId: string) =>
    Routes.slug(site, deploymentId),
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
  const previousProdRevisionName = await getProdRevisionName({ k8sApi, site });

  const revisionName = `${site}-site-${deploymentId}`;
  await upsertObject(
    ctx.kc,
    revisionRoute({
      routeName: Routes.prod(site),
      revisionName,
      namespace: Namespace.forSite(site),
    }),
    GROUP_SERVING_KNATIVE_DEV,
    VERSION_V1,
    PLURAL_ROUTES,
  );

  allowScaleToZero({ revisionName: previousProdRevisionName, site, ctx });
}
