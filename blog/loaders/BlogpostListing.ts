import { logger } from "@deco/deco/o11y";
import { PageInfo } from "../../commerce/types.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { BlogPost, BlogPostListingPage, SortBy } from "../types.ts";
import handlePosts, { slicePosts } from "../core/handlePosts.ts";
import { getRecordsByPath } from "../core/records.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";

export interface Props {
  /**
   * @title Category slug
   * @description Filter posts by category slug.
   */
  slug?: RequestURLParam;
  /**
   * @title Items per page
   */
  count?: number;
  /**
   * @title Page number
   */
  page?: number;
  /**
   * @title Sort
   * @description Default: date_desc
   */
  sortBy?: SortBy;
  /**
   * @description Search term (also read from ?q= query param).
   */
  query?: string;
}

export const cache = { maxAge: 60 };

export const cacheKey = (
  props: Props,
  req: Request,
  _ctx: AppContext,
): string => {
  const url = new URL(req.url);
  const page = Number(props.page ?? url.searchParams.get("page") ?? 1);
  const count = Number(props.count ?? url.searchParams.get("count") ?? 12);
  const slug = String(props.slug ?? url.searchParams.get("slug") ?? "");
  const sort = String(
    props.sortBy ?? url.searchParams.get("sortBy") ?? "date_desc",
  );
  const query = String(props.query ?? url.searchParams.get("q") ?? "");
  return `blog-listing-p${page}-c${count}-s${slug}-${sort}-q${query}`;
};

/**
 * @title BlogPostListing
 * @description Returns a paginated listing page of blog posts from native
 *   Deco block storage. Spire posts are included automatically when synced.
 */
export default async function BlogPostListing(
  { page, count, slug, sortBy, query }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPostListingPage | null> {
  const url = new URL(req.url);
  const params = url.searchParams;
  const postsPerPage = Number(count ?? params.get("count") ?? 12);
  const pageNumber = Number(page ?? params.get("page") ?? 1);
  const pageSort = (sortBy ?? params.get("sortBy") ?? "date_desc") as SortBy;
  const term = query ?? params.get("q") ?? undefined;

  const posts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );

  try {
    const handled = await handlePosts(
      posts,
      pageSort,
      ctx,
      slug,
      undefined,
      term,
    );
    if (!handled) return null;

    const sliced = slicePosts(handled, pageNumber, postsPerPage);
    if (sliced.length === 0) return null;

    const category = sliced[0].categories?.find((c) => c.slug === slug);
    return {
      posts: sliced,
      pageInfo: toPageInfo(handled, postsPerPage, pageNumber, params),
      seo: {
        title: category?.name ?? "",
        canonical: new URL(url.pathname, url.origin).href,
      },
    };
  } catch (e) {
    logger.error(e);
    return null;
  }
}

const toPageInfo = (
  posts: BlogPost[],
  postsPerPage: number,
  pageNumber: number,
  params: URLSearchParams,
): PageInfo => {
  const total = posts.length;
  const totalPages = Math.ceil(total / postsPerPage);
  const hasNext = totalPages > pageNumber;
  const hasPrev = pageNumber > 1;
  const nextParams = new URLSearchParams(params);
  const prevParams = new URLSearchParams(params);
  if (hasNext) nextParams.set("page", String(pageNumber + 1));
  if (hasPrev) prevParams.set("page", String(pageNumber - 1));
  return {
    nextPage: hasNext ? `?${nextParams}` : undefined,
    previousPage: hasPrev ? `?${prevParams}` : undefined,
    currentPage: pageNumber,
    records: total,
    recordPerPage: postsPerPage,
  };
};
