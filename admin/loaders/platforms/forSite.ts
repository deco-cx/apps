import kubernetes from "../../../platforms/kubernetes/platform.ts";
import subhosting from "../../../platforms/subhosting/platform.ts";
import { getPlatformOf } from "../../actions/platforms/assign.ts";
import { AppContext } from "../../mod.ts";
import { Platform } from "../../platform.ts";

export interface Props {
  site: string;
}

export default async function forSite(
  _props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Platform> {
  const platformName = await getPlatformOf(_props.site);

  if (platformName === "kubernetes") {
    return kubernetes(ctx.invoke.kubernetes);
  } else if (platformName === "subhosting") {
    return subhosting(ctx.invoke["deno-subhosting"]);
  }
  return kubernetes(ctx.invoke.kubernetes);
}
