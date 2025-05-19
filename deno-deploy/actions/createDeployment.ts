import { AppContext } from "../mod.ts";
import { CreateDeploymentRequest, Deployment } from "../client.ts";

interface Props extends CreateDeploymentRequest {
  /**
   * @title Project ID
   * @description The ID of the project to create the deployment in
   */
  projectId: string;
}

/**
 * @title Create Deployment
 * @description Creates a new deployment in Deno Deploy
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Deployment> => {
  const { projectId, ...deploymentData } = props;

  const response = await ctx.api["POST /projects/:projectId/deployments"](
    { projectId },
    { body: deploymentData },
  );

  const result = await response.json();

  return result;
};

export default action;
