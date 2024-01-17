import kubernetes from "../../../platforms/kubernetes/platform.ts";
import { AppContext } from "../../mod.ts";
import { Platform } from "../../platform.ts";

export interface Props {
  site: string;
}

export default function forSite(
  _props: Props,
  _req: Request,
  ctx: AppContext,
): Platform {
  return kubernetes(ctx.invoke.kubernetes);
}
