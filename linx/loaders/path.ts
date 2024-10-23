import { STALE } from "../../utils/fetch.ts";
import type { AppContext } from "../mod.ts";
import type { API } from "../utils/client.ts";
import { redirect } from "@deco/deco";
/**
 * @title LINX Integration
 * @description Load Page as JSON
 *
 * This is the loader used for getting a big part of a Linx website content,
 * including:
 *
 * - Product Detail Pages
 * - Product Category Pages
 * - Product Listing Pages
 * - Auction Listing Pages
 * - Auction Detail Pages
 *
 * This works by forwarding the upstream URL path then appending `.json` at
 * the end. Linx websites will accept this and return the page content as `JSON`.
 * All of the loaders cited up there use the linx path loader internally.
 */
async function loader(
  props: Record<string, string>,
  req: Request,
  ctx: AppContext,
): Promise<API["GET /*splat"]["response"] | null> {
  const upstream = new URL(req.url);
  const params: Record<string, string[]> = {};
  upstream.searchParams.forEach((value, key) => {
    params[key] = params[key] || [];
    params[key].push(value);
  });
  /**
   * TODO: Fix the /*splat route being called for images and other assets.
   */
  if (upstream.pathname.endsWith(".png")) {
    console.error("imagem");
    return null;
  }
  const splat = `${upstream.pathname.slice(1)}.json`;
  const defaults = {
    fc: params.fc || props.fc || "false",
  };
  const isSearch = upstream.searchParams.has("t");
  const response = await ctx.api["GET /*splat"](
    { splat, ...params, ...props, ...defaults },
    isSearch
      ? {
        redirect: "manual",
      }
      : STALE,
  );
  if (response.status === 301) {
    const redirectUrlRaw = response.headers.get("location");
    if (!redirectUrlRaw) {
      return null;
    }
    const redirectUrl = new URL(redirectUrlRaw);
    throw redirect(redirectUrl);
  }
  return response.json();
}
export default loader;
