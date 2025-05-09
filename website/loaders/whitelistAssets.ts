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
  // Avoid cache on /live/invoke only
  if (
    new URL(_req.url).pathname ===
      ("/live/invoke/website/loaders/whitelistAssets.ts")
  ) {
    ctx.response.headers.set("Cache-Control", "public, max-age=60");
  }
  return {
    "whitelistURLs": ctx.whilelistURLs,
    "disableProxy": ctx.disableProxy,
  };
}

export const cache = "stale-while-revalidate";

export const cacheKey = (_props: unknown, req: Request, _ctx: AppContext) => {
  const url = new URL(req.url);
  url.pathname = "/live/invoke/website/loaders/whitelistAssets.ts";
  return url.href;
};
