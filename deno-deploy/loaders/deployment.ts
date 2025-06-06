import { AppContext } from "../mod.ts";
import { Deployment } from "../client.ts";

interface Props {
  /**
   * @title Deployment ID
   * @description The ID of the deployment to fetch
   */
  deploymentId: string;
}

/**
 * @title Get Deployment Details
 * @description Retrieves details of a specific Deno Deploy deployment
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Deployment> => {
  const { deploymentId } = props;

  const response = await ctx.api["GET /deployments/:deploymentId"]({
    deploymentId,
  });

  const result = await response.json();

  return result;
};

export default loader;
