import { routeOf } from "../../common/knative/route.ts";
import { upsertObject } from "../../common/objects.ts";
import { AppContext } from "../../mod.ts";

export interface Props {
  site: string;
  deploymentId: string;
}

/**
 * Rollout an specific deployment to production without promotion(next pushes will take changes back in prod).
 * @title Deployment Rollout
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
