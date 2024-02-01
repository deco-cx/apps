import { assertHasDeploymentParams, SubhostingConfig } from "../../commons.ts";
import { AppContext } from "../../mod.ts";
import { Subhosting } from "../../subhosting.ts";

export interface Project {
  id: string;
  name: string;
  defaultDatabaseId: string;
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

  assertHasDeploymentParams({
    deployAccessToken,
    deployOrgId,
    projectId: "placeholder",
  });

  const client = new Subhosting(deployAccessToken, deployOrgId);
  const [projectResponse, db] = await Promise.all([
    client.createProject(props.name).then((pr) => pr.json()),
    client.createDatabase().then((db) => db.json()),
  ]);
  return {
    id: projectResponse.id,
    name: projectResponse.name,
    defaultDatabaseId: db.id,
  };
}
