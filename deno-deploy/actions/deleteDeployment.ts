import { AppContext } from "../mod.ts";

interface Props {
  /**
   * @title Deployment ID
   * @description The ID of the deployment to delete
   */
  deploymentId: string;
}

/**
 * @title Delete Deployment
 * @description Deletes a deployment from Deno Deploy
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  const { deploymentId } = props;

  await ctx.api["DELETE /deployments/:deploymentId"]({
    deploymentId,
  });

  return;
};

export default action;
