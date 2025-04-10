import { AppContext } from "../mod.ts";
import { Deployment, RedeployRequest } from "../client.ts";

interface Props extends RedeployRequest {
  /**
   * @title Deployment ID
   * @description The ID of the deployment to redeploy
   */
  deploymentId: string;
}

/**
 * @title Redeploy Deployment
 * @description Redeploys an existing deployment with new configuration
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Deployment> => {
  const { deploymentId, ...redeployData } = props;

  const response = await ctx.api["POST /deployments/:deploymentId/redeploy"](
    { deploymentId },
    { body: redeployData },
  );

  const result = await response.json();

  return result;
};

export default action;
