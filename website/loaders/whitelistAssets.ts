import { AppContext } from "../mod.ts";

/**
 * @title Whitelist Assets
 */
export default function WhitelistAssets(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): {
  "whitelistURLs": string[] | undefined;
  "disableProxy": boolean | undefined;
} {
  return {
    "whitelistURLs": ctx.whilelistURLs,
    "disableProxy": ctx.disableProxy,
  };
}
