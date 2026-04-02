import { logger } from "@deco/deco/o11y";
import { PageInfo } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { BlogPost, BlogPostListingPage, SpirePagination } from "../types.ts";
import { spirePostSummaryToBlogPost } from "./BlogpostList.ts";

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
 * @title BlogpostListing
 * @description Retrieves a paginated listing page of Spire blog posts.
 */
export const cache = {
  maxAge: 60 * 60 * 24, // 24 hours
};

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
  const count = parseIntParam(props.count ?? url.searchParams.get("count"), 12);
  return `spire-listing-${ctx.account}-page${page}-count${count}`;
};

export default async function BlogpostListing(
  { page, count }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPostListingPage | null> {
  const { account, api } = ctx;
  const url = new URL(req.url);
  const params = url.searchParams;
  const perPage = parseIntParam(count ?? params.get("count"), 12);
  const pageNumber = parseIntParam(page ?? params.get("page"), 1);

  try {
    const response = await api["GET /blog/:account"](
      { account, page: pageNumber, perPage },
    );

    if (!response.ok) {
      return null;
    }

    const { posts: rawPosts, pagination, blog } = await response.json();
    const posts: BlogPost[] = (rawPosts ?? []).map(spirePostSummaryToBlogPost);

    return {
      posts,
      pageInfo: toPageInfo(pagination, params),
      seo: {
        title: blog?.name || "Blog",
        canonical: new URL(url.pathname, url.origin).href,
      },
    };
  } catch (e) {
    logger.error(e);
    return null;
  }
}

function toPageInfo(
  pagination: SpirePagination,
  params: URLSearchParams,
): PageInfo {
  const { page, totalPages, total, perPage } = pagination;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const nextPageParams = new URLSearchParams(params);
  const prevPageParams = new URLSearchParams(params);

  if (hasNextPage) nextPageParams.set("page", String(page + 1));
  if (hasPrevPage) prevPageParams.set("page", String(page - 1));

  return {
    nextPage: hasNextPage ? `?${nextPageParams}` : undefined,
    previousPage: hasPrevPage ? `?${prevPageParams}` : undefined,
    currentPage: page,
    records: total,
    recordPerPage: perPage,
  };
}
