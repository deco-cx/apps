import {
  adjectives,
  animals,
  NumberDictionary,
  uniqueNamesGenerator,
} from "https://esm.sh/v135/unique-names-generator@4.7.1";
import { AppContext } from "../../mod.ts";
import { Deployment } from "../../platform.ts";

const numberDictionary = NumberDictionary.generate({ min: 10, max: 99 });

export interface Props {
  name: string;
  platform: PlatformName;
  lifecycle?: "ephemeral" | "persistent";
}

export type PlatformName = "kubernetes" | "subhosting" | "play";

export interface Site {
  name: string;
  deployment?: Deployment;
}

export default async function create(
  { name: _name, platform: platformName, lifecycle }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Site> {
  const name = _name ?? uniqueNamesGenerator({
    dictionaries: [animals, adjectives, numberDictionary],
    length: 3,
    separator: "-",
  });
  const { invoke: { "deco-sites/admin": admin } } = ctx;
  await admin.actions.platforms.assign({ site: name, platform: platformName });
  const platform = await admin.loaders.platforms.forSite({
    site: name,
  });
  await platform.sites.create({
    site: name,
    mode: "files",
    lifecycle: lifecycle ?? "ephemeral", // this should be changed when site creation is moved to the control plane
  });

  const deployment = await admin.actions.deployments
    .create({
      site: name,
    });

  return { name, deployment };
}
