import { SubhostingConfig } from "../../../platforms/subhosting/commons.ts";
import { AppContext } from "../../mod.ts";

export interface Props extends Omit<SubhostingConfig, "projectId"> {
  name?: string;
}

export interface Site {
  id: string;
  name: string;
}

export default async function create(
  { name }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Site> {
  const { invoke } = ctx;
  const { actions: { projects: { create } } } = invoke["deno-subhosting"];
  const site = await create({ name });
  return site;
}
