import { Suggestion } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { getSegmentFromBag, withSegmentCookie } from "../../utils/segment.ts";

export interface Props {
  query?: string;
}

export default async function loader(
  { query }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Suggestion> {
  const segment = getSegmentFromBag(ctx);
  const locale = segment?.payload?.cultureInfo ??
    ctx.defaultSegment?.cultureInfo ?? "pt-BR";

  return await ctx.vcsDeprecated[
    "GET /api/io/_v/api/intelligent-search/search_suggestions"
  ](
    {
      locale,
      query: query ?? "",
    },
    {
      headers: withSegmentCookie(segment),
    },
  ).then((res) => res.json());
}
