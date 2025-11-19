import { AppContext } from "../../mod.ts";
import { getSegmentFromBag, withSegmentCookie } from "../../utils/segment.ts";
import { STALE } from "../../../utils/fetch.ts";
import { Category } from "../../../commerce/types.ts";

export interface Props {
  /**
   * @title The number of category level that should be listed
   * @default 1
   */
  categoryLevels?: number;
}

/**
 * @title Get Category Tree
 * @description Get the category tree
 */
export default async function loader(
  { categoryLevels }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Category | Category[]> {
  return await ctx.vcsDeprecated
    ["GET /api/catalog_system/pub/category/tree/:level"]({
      level: categoryLevels ?? 1,
    }, { ...STALE, headers: withSegmentCookie(getSegmentFromBag(ctx)) })
    .then((res) => res.json());
}

export const cache = {
  maxAge: 60 * 60, // 1 hour
};

export const cacheKey = (props: Props) => {
  return `category-tree-${props.categoryLevels ?? 1}`;
};
