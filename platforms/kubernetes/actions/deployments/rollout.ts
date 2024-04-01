import { revisionRoute } from "../../common/knative/route.ts";
import { upsertObject } from "../../common/objects.ts";
import { AppContext } from "../../mod.ts";
import { Namespace } from "../sites/create.ts";

export interface Props {
  site: string;
  deploymentId: string;
}

export const Routes = {
  prod: (site: string) => `sites-${site}`,
  preview: (site: string, deploymentId: string) =>
    `${Routes.prod(site)}-${deploymentId}`,
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
  const revisionName = `${site}-site-${deploymentId}`;
  await upsertObject(
    ctx.kc,
    revisionRoute({
      routeName: Routes.prod(site),
      revisionName,
      namespace: Namespace.forSite(site),
    }),
    "serving.knative.dev",
    "v1",
    "routes",
  );
}
