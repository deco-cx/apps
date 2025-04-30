import { AppContext } from "../mod.ts";
import { CreateDeploymentRequest, Deployment } from "../client.ts";

interface Props {
  /**
   * @title Project ID
   * @description The ID of the project to create the deployment in
   */
  projectId: string;

  /**
   * @title Script Content
   * @description The content of the script to deploy. ex: "Deno.serve((req: Request) => new Response("Hello World"));"
   */
  scriptContent: string;

  /**
   * @title Description
   * @description Optional description for the deployment
   */
  description?: string;
}

/**
 * @title Deploy Script
 * @description Creates a new deployment in Deno Deploy with just the script content
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Deployment> => {
  const { projectId, scriptContent, description } = props;
  const entryPoint = "main.ts";

  // Create the deployment request with the script content
  const deploymentData: CreateDeploymentRequest = {
    entryPointUrl: entryPoint,
    importMapUrl: null,
    lockFileUrl: null,
    compilerOptions: null,
    assets: {
      [entryPoint]: {
        kind: "file",
        content: scriptContent,
        encoding: "utf-8",
      },
    },
    envVars: {},
    description: description || null,
  };

  // Call the API to create the deployment
  const response = await ctx.api["POST /projects/:projectId/deployments"](
    { projectId },
    { body: deploymentData },
  );

  const result = await response.json();

  return result;
};

export default action;
