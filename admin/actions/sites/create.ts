import { SubhostingConfig } from "../../../platforms/subhosting/commons.ts";
import { AppContext } from "../../mod.ts";

export interface Props extends Omit<SubhostingConfig, "projectId"> {
  name?: string;
}

export interface Site {
  id: string;
  name: string;
  domain?: string;
}

export default async function create(
  { name, deployAccessToken, deployOrgId }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Site> {
  const { invoke } = ctx;
  const { actions: { projects } } = invoke["deno-subhosting"];
  const site = await projects.create({ name, deployAccessToken, deployOrgId });

  console.log({ site });

  const deployment = await invoke["deco-sites/admin"].actions.deployments
    .create({
      site: site.name,
      projectId: site.id,
      deployAccessToken,
      deployOrgId,
    });

  return { ...site, ...deployment };
}
