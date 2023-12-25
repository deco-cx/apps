import { SiteState } from "../../loaders/siteState/get.ts";
import { AppContext } from "../../mod.ts";

export interface Props {
  site: string;
  state: SiteState;
  deploymentId: string;
}

/**
 * Promotes the given deployment to production.
 * @title Deployment Promotion
 */
export default async function promote(
  { site, state, deploymentId }: Props,
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
  });
}
