import kubernetes from "../../../platforms/kubernetes/platform.ts";
import { AppContext } from "../../mod.ts";
import { Platform } from "../../platform.ts";
import { badRequest } from "deco/mod.ts";

export interface Props {
  site: string;
}

export default function forSite(
  { site }: Props,
  _req: Request,
  ctx: AppContext,
): Platform {
  const platforms = [kubernetes(ctx.invoke.kubernetes)];
  const selectedPlatform = site && ctx.sitePlatform[site];
  const platform = platforms.find(({ name }) => name === selectedPlatform);
  if (!platform) {
    badRequest({ message: "invalid site platform" });
  }
  return platform!;
}
