import { SiteState } from "../../loaders/siteState/get.ts";
import { AppContext } from "../../mod.ts";

export interface Props {
  site: string;
  state: SiteState;
  deploymentId: string;
  create?: boolean;
}

/**
 * Creates a new Knative Service and the routes for it depending wether in production or not.
 */
export default async function promote(
  { site, state, create, deploymentId }: Props,
  _req: Request,
  ctx: AppContext,
) {
  await ctx.invoke.kubernetes.actions.deployments.rollout({
    site,
    deploymentId,
  });
  await ctx.invoke.kubernetes.actions.siteState.upsert({
    site,
    state,
    create,
  });
}
