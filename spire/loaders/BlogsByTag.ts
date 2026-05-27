import { logger } from "@deco/deco/o11y";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { BlogPost } from "../types.ts";
import { spirePostSummaryToBlogPost } from "./BlogpostList.ts";

export interface Props {
  /**
   * @title Tag slug
   * @description The tag's slug to filter posts by.
   */
  tagSlug: RequestURLParam;
}

/**
 * @title Posts by Tag
 * @description Retrieves all published posts for a specific Spire blog tag.
 */
export const cache = {
  maxAge: 60 * 60 * 24, // 24 hours
};

export const cacheKey = (props: Props, req: Request, ctx: AppContext) => {
  const url = new URL(req.url);
  const slug = props.tagSlug ?? url.searchParams.get("tagSlug") ?? "";
  return `spire-by-tag::${encodeURIComponent(ctx.account)}::${encodeURIComponent(slug)}`;
};

export default async function BlogsByTag(
  { tagSlug }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPost[]> {
  const { account, api } = ctx;
  const url = new URL(req.url);
  const slug = tagSlug ?? url.searchParams.get("tagSlug") ?? "";

  if (!slug) {
    logger.error("BlogsByTag: tagSlug is required");
    return [];
  }

  try {
    const response = await api["GET /blog/:account/tags/:tagSlug"](
      { account, tagSlug: slug },
    );

    if (!response.ok) {
      logger.error(
        `BlogsByTag: fetch failed for tag "${slug}" — ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const { posts } = await response.json();
    return (posts ?? []).map(spirePostSummaryToBlogPost);
  } catch (e) {
    logger.error(e);
    return [];
  }
}
