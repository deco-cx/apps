import { AppContext } from "../mod.ts";

/**
 * @title Pages
 */
export default function Pages(
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
