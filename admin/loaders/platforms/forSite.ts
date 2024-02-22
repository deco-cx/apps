import kubernetes from "../../../platforms/kubernetes/platform.ts";
import subhosting from "../../../platforms/subhosting/platform.ts";
import { getPlatformOf } from "../../actions/platforms/assign.ts";
import { PlatformName } from "../../actions/sites/create.ts";
import { AppContext } from "../../mod.ts";
import { Platform } from "../../platform.ts";
import play from "../../play/platform.ts";

export interface Props {
  site: string;
  default?: PlatformName;
}

export default async function forSite(
  { site, default: defaultPlatform }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Platform> {
  // add dummy platform.
  const platformName = ctx.platformAssignments[site] ??
    await getPlatformOf(site) ?? defaultPlatform;

  if (platformName === "kubernetes") {
    return kubernetes(ctx.invoke.kubernetes);
  } else if (platformName === "subhosting") {
    return subhosting(ctx.invoke["deno-subhosting"]);
  } else if (platformName === "play") {
    return play(ctx.invoke.kubernetes);
  }
  throw new Error(`platform is not assigned for ${site}`);
}
