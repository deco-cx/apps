import { AppContext } from "../../mod.ts";
import { getSegmentFromBag, withSegmentCookie } from "../../utils/segment.ts";
import { STALE } from "../../../utils/fetch.ts";
import { Suggestion } from "../../../commerce/types.ts";

export default async function (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Suggestion> {
  const locale = "pt-BR"; // config!.defaultLocale; // TODO

  return await ctx.vcsDeprecated
    ["GET /api/io/_v/api/intelligent-search/top_searches"]({
      locale,
    }, { ...STALE, headers: withSegmentCookie(getSegmentFromBag(ctx)) })
    .then((res) => res.json());
}
