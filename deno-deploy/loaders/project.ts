import { AppContext } from "../mod.ts";
import { Project } from "../client.ts";

interface Props {
  /**
   * @title Project ID
   * @description The ID of the project to fetch
   */
  projectId: string;
}

/**
 * @title Get Project Details
 * @description Retrieves details of a specific Deno Deploy project
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Project> => {
  const { projectId } = props;

  const response = await ctx.api["GET /projects/:projectId"]({
    projectId,
  });

  const result = await response.json();

  return result;
};

export default loader;
