import { assertHasDeploymentParams, SubhostingConfig } from "../../commons.ts";
import { Subhosting } from "../../deps.ts";
import { AppContext } from "../../mod.ts";

export interface Project {
  id: string;
  name: string;
}
export interface Props extends SubhostingConfig {
  name?: string;
}
export default async function create(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Project> {
  const deployAccessToken = props.deployAccessToken ??
    ctx.deployAccessToken;
  const deployOrgId = props.deployOrgId ?? ctx.deployOrgId;
  const projectId = props.projectId ?? ctx.projectId;
  assertHasDeploymentParams({ deployAccessToken, deployOrgId, projectId });
  const client = new Subhosting(deployAccessToken, deployOrgId);
  const pr = await client.createProject(props.name);
  const projectResponse = await pr.json();
  return {
    id: projectResponse.id,
    name: projectResponse.name,
  };
}
