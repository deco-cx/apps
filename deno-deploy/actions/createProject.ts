import { AppContext } from "../mod.ts";
import { CreateProjectRequest, Project } from "../client.ts";

interface Props extends CreateProjectRequest {
  /**
   * @title Organization ID
   * @description The ID of the organization to create the project in
   */
  organizationId: string;
}

/**
 * @title Create Project
 * @description Creates a new project in Deno Deploy
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Project> => {
  const { organizationId, ...projectData } = props;

  const response = await ctx.api
    ["POST /organizations/:organizationId/projects"](
      { organizationId },
      { body: projectData },
    );

  const result = await response.json();

  return result;
};

export default action;
