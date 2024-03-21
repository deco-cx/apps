import { AppContext, PathsToCache } from "../../mod.ts";
import { getSegmentFromBag, withSegmentCookie } from "../../utils/segment.ts";
import { STALE } from "../../../utils/fetch.ts";
import { Search } from "../../../commerce/types.ts";
import { ENABLE_LOADER_CACHE } from "deco/blocks/loader.ts";

export default async function (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<PathsToCache> {
  const locale = "pt-BR"; // config!.defaultLocale; // TODO

  if(!ENABLE_LOADER_CACHE){
    return new Set();
  }

  const response = await ctx.vcsDeprecated
    ["GET /api/io/_v/api/intelligent-search/top_searches"]({
      locale,
    }, { ...STALE, headers: withSegmentCookie(getSegmentFromBag(ctx)) })
    .then((res) => res.json());

  return new Set(response.searches.map((s: Search) => s.term))
}

export const cache = "stale-while-revalidate";

export const cacheKey = (): string => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    return dateString;
}