import { AppContext } from "../mod.ts";
import { BuildLogsResponseEntry } from "../client.ts";

interface Props {
  /**
   * @title Deployment ID
   * @description The ID of the deployment to fetch build logs from
   */
  deploymentId: string;
}

/**
 * @title Get Build Logs
 * @description Retrieves build logs of a specific Deno Deploy deployment
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BuildLogsResponseEntry[]> => {
  const { deploymentId } = props;

  const response = await ctx.api["GET /deployments/:deploymentId/build_logs"]({
    deploymentId,
  });

  const result = await response.json();

  return result;
};

export default loader;
