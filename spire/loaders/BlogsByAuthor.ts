import { logger } from "@deco/deco/o11y";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { BlogPost } from "../types.ts";
import { spirePostSummaryToBlogPost } from "./BlogpostList.ts";

export interface Props {
  /**
   * @title Author slug
   * @description The author's slug to filter posts by.
   */
  authorSlug: RequestURLParam;
}

/**
 * @title Posts by Author
 * @description Retrieves all published posts for a specific Spire blog author.
 */
export const cache = {
  maxAge: 60, // 1 minute — near-real-time for Spire publish
};

export const cacheKey = (props: Props, req: Request, ctx: AppContext) => {
  const url = new URL(req.url);
  const slug = props.authorSlug ?? url.searchParams.get("authorSlug") ?? "";
  return `spire-by-author-${ctx.account}-${slug}`;
};

export default async function BlogsByAuthor(
  { authorSlug }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPost[]> {
  const { account, api } = ctx;
  const url = new URL(req.url);
  const slug = authorSlug ?? url.searchParams.get("authorSlug") ?? "";

  if (!slug) {
    logger.error("BlogsByAuthor: authorSlug is required");
    return [];
  }

  try {
    const response = await api["GET /blog/:account/authors/:authorSlug"](
      { account, authorSlug: slug },
    );

    if (!response.ok) {
      logger.error(
        `BlogsByAuthor: fetch failed for author "${slug}" — ${response.status} ${response.statusText}`,
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
