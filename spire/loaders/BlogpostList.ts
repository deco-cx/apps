import { logger } from "@deco/deco/o11y";
import { AppContext } from "../mod.ts";
import { BlogPost, SpirePostSummary } from "../types.ts";

export interface Props {
  /**
   * @title Items per page
   * @description Number of posts per page to display.
   */
  count?: number;
  /**
   * @title Page number
   * @description The current page number. Defaults to 1.
   */
  page?: number;
}

/**
 * @title BlogpostList
 * @description Retrieves a list of Spire blog posts.
 */
export const cache = {
  maxAge: 60 * 60 * 24, // 24 hours
};

const MAX_COUNT = 100;

/** Parse an integer from a value that may be a number, string, or null. Falls back to `fallback` on NaN/null. */
function parseIntParam(
  value: number | string | null | undefined,
  fallback: number,
): number {
  const n = parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const cacheKey = (props: Props, req: Request, ctx: AppContext) => {
  const url = new URL(req.url);
  const page = parseIntParam(props.page ?? url.searchParams.get("page"), 1);
  const count = Math.min(
    parseIntParam(props.count ?? url.searchParams.get("count"), 12),
    MAX_COUNT,
  );
  return `spire-list-${ctx.account}-page${page}-count${count}`;
};

export default async function BlogpostList(
  { page, count }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPost[]> {
  const { account, api } = ctx;
  const url = new URL(req.url);
  const perPage = Math.min(
    parseIntParam(count ?? url.searchParams.get("count"), 12),
    MAX_COUNT,
  );
  const pageNumber = parseIntParam(page ?? url.searchParams.get("page"), 1);

  try {
    const response = await api["GET /blog/:account"](
      { account, page: pageNumber, perPage },
    );

    if (!response.ok) {
      return [];
    }

    const { posts } = await response.json();
    const blogPosts = (posts ?? []).map(spirePostSummaryToBlogPost);

    return blogPosts.length > 0 ? blogPosts : [];
  } catch (e) {
    logger.error(e);
    return [];
  }
}

export function spirePostSummaryToBlogPost(
  summary: SpirePostSummary,
): BlogPost {
  return {
    id: summary.id,
    title: summary.title,
    excerpt: summary.description,
    image: summary.imageUrl,
    alt: summary.title,
    authors: [],
    categories: [],
    date: summary.publishedAt ?? "",
    slug: summary.slug,
  };
}
