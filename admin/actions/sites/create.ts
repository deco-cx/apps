import { AppContext } from "../../mod.ts";
import { Deployment } from "../../platform.ts";

export interface Props {
  name: string;
  platform: PlatformName;
}

export type PlatformName = "kubernetes" | "subhosting";

export interface Site {
  name: string;
  deployment?: Deployment;
}

export default async function create(
  { name, platform: platformName }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Site> {
  const { invoke: { "deco-sites/admin": admin } } = ctx;
  await admin.actions.platforms.assign({ site: name, platform: platformName });
  const platform = await admin.loaders.platforms.forSite({ site: name });
  await platform.sites.create({ site: name, mode: "files" });

  const deployment = await admin.actions.deployments
    .create({
      site: name,
    });

  return { name, deployment };
}
