import { AppContext } from "../../mod.ts";
import { getSegmentFromBag, withSegmentCookie } from "../../utils/segment.ts";
import { STALE } from "../../../utils/fetch.ts";
import { Suggestion } from "../../../commerce/types.ts";

/**
 * @title Top Searches
 * @description List the top searches.
 */
export default async function (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Suggestion> {
  const segment = getSegmentFromBag(ctx);
  const locale = segment?.payload?.cultureInfo ??
    ctx.defaultSegment?.cultureInfo ?? "pt-BR";

  return await ctx.vcsDeprecated
    ["GET /api/io/_v/api/intelligent-search/top_searches"]({
      locale,
    }, { ...STALE, headers: withSegmentCookie(getSegmentFromBag(ctx)) })
    .then((res) => res.json());
}
