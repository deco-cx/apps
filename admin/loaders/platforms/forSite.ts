import kubernetes from "../../../platforms/kubernetes/platform.ts";
import subhosting from "../../../platforms/subhosting/platform.ts";
import { getPlatformOf } from "../../actions/platforms/assign.ts";
import { AppContext } from "../../mod.ts";
import { Platform } from "../../platform.ts";
import play from "../../play/platform.ts";

export interface Props {
  site: string;
}

export default async function forSite(
  { site }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Platform> {
  // add dummy platform.
  const platformName = ctx.platformAssignments[site] ??
    await getPlatformOf(site);

  if (platformName === "kubernetes") {
    return kubernetes(ctx.invoke.kubernetes);
  } else if (platformName === "subhosting") {
    return subhosting(ctx.invoke["deno-subhosting"]);
  } else if (platformName === "play") {
    return play(ctx.invoke.kubernetes);
  } else if (platformName === "none") {
    throw new Error(`none platform is used for ${site}`);
  }
  return kubernetes(ctx.invoke.kubernetes);
}
