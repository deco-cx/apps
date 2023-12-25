import { routeOf } from "../../common/knative/route.ts";
import { upsertObject } from "../../common/objects.ts";
import { AppContext } from "../../mod.ts";

export interface Props {
  site: string;
  deploymentId: string;
}

/**
 * Creates a new Knative Service and the routes for it depending wether in production or not.
 */
export default async function rollout(
  { site, deploymentId }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const revisionName = `site-${deploymentId}`;
  await upsertObject(
    ctx.kc,
    routeOf({
      routeName: `site`,
      revisionName,
      namespace: site,
    }),
    "serving.knative.dev",
    "v1",
    "routes",
  );
}
