/**
 * Retrieves a listing page of blog posts.
 *
 * @param props - The props for the blog post listing.
 * @param req - The request object.
 * @param ctx - The application context.
 * @returns A promise that resolves to an array of blog posts.
 */
import { logger } from "@deco/deco/o11y";
import { PageInfo } from "../../commerce/types.ts";
import { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { BlogPost, BlogPostListingPage, Category, SortBy } from "../types.ts";
import handlePosts, { slicePosts } from "../core/handlePosts.ts";
import { getRecordsByPath } from "../core/records.ts";
import {
  ancestorsOf,
  descendantSlugs,
  indexCategories,
  withCategoryPath,
} from "../core/categoryTree.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";
const CATEGORIES_PATH = "collections/blog/categories";
const CATEGORY_ACCESSOR = "category";

export interface Props {
  /**
   * @title Category Slug
   * @description Filter by a category slug. May be a full path ("parent/child")
   * when the listing route is a catch-all; posts of every subcategory below the
   * last segment are included.
   */
  slug?: RequestURLParam;
  /**
   * @title Items per page
   * @description Number of posts per page to display.
   */
  count?: number;
  /**
   * @title Page query parameter
   * @description The current page number. Defaults to 1.
   */
  page?: number;
  /**
   * @title Page sorting parameter
   * @description The sorting option. Default is "date_desc"
   */
  sortBy?: SortBy;
  /**
   * @description Overrides the query term at url
   */
  query?: string;
}

/**
 * @title BlogPostList
 * @description Retrieves a list of blog posts.
 *
 * @param props - The props for the blog post list.
 * @param req - The request object.
 * @param ctx - The application context.
 * @returns A promise that resolves to an array of blog posts.
 */
export default async function BlogPostList(
  { page, count, slug, sortBy, query }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPostListingPage | null> {
  const url = new URL(req.url);
  const params = url.searchParams;
  const postsPerPage = Number(count ?? params.get("count") ?? 12);
  const pageNumber = Number(page ?? params.get("page") ?? 1);
  const pageSort = sortBy ?? (params.get("sortBy") as SortBy) ?? "date_desc";
  const term = query ?? params.get("q") ?? undefined;

  const posts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );

  try {
    let categories: Category[] | null = null;
    try {
      categories = await loadCategories(ctx);
    } catch (e) {
      logger.error(e);
    }

    // The slug prop carries the whole category path ("pai/filho") when the
    // site routes the listing as a catch-all; only the leaf identifies the
    // category, the segments before it are its ancestors.
    const requestedSegments = (slug ?? "").split("/").filter(Boolean);
    const leafSlug = requestedSegments[requestedSegments.length - 1];

    const index = indexCategories(categories);
    const chain = leafSlug ? ancestorsOf(leafSlug, index) : null;

    // A parent lists its own posts plus every descendant's.
    const categorySlugs = leafSlug
      ? descendantSlugs(leafSlug, categories)
      : undefined;

    const handledPosts = await handlePosts(
      posts,
      pageSort,
      ctx,
      categorySlugs,
      undefined,
      term,
    );

    if (!handledPosts) {
      return null;
    }

    const slicedPosts = slicePosts(handledPosts, pageNumber, postsPerPage);

    if (slicedPosts.length === 0) {
      return null;
    }

    let category: Category | null = null;
    if (leafSlug) {
      // The category may not be a record yet — fall back to the copy embedded
      // in a post, as before.
      category = index.get(leafSlug) ??
        slicedPosts[0]?.categories?.find((c) => c?.slug === leafSlug) ?? null;
    }

    // Only a chain that came out of the records is trustworthy enough to name
    // a canonical URL; a missing or broken one keeps the flat behaviour.
    const canonical = chain
      ? withCategoryPath(url, chain, { requested: requestedSegments })
      : null;

    return {
      posts: slicedPosts,
      category,
      categories,
      categoryPath: chain ?? (category ? [category] : null),
      pageInfo: toPageInfo(handledPosts, postsPerPage, pageNumber, params),
      seo: {
        title: category?.name ?? "",
        description: category?.description,
        // Reached through a stale or wrong path, the page still renders and
        // points at the one canonical URL instead of 404ing.
        canonical: canonical ?? new URL(url.pathname, url.origin).href,
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
  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const hasNextPage = totalPages > pageNumber;
  const hasPrevPage = pageNumber > 1;
  const nextPage = new URLSearchParams(params);
  const previousPage = new URLSearchParams(params);

  if (hasNextPage) {
    nextPage.set("page", (pageNumber + 1).toString());
  }

  if (hasPrevPage) {
    previousPage.set("page", (pageNumber - 1).toString());
  }

  return {
    nextPage: hasNextPage ? `?${nextPage}` : undefined,
    previousPage: hasPrevPage ? `?${previousPage}` : undefined,
    currentPage: pageNumber,
    records: totalPosts,
    recordPerPage: postsPerPage,
  };
};

const loadCategories = async (ctx: AppContext): Promise<Category[]> => {
  const categories = await getRecordsByPath<Category>(
    ctx,
    CATEGORIES_PATH,
    CATEGORY_ACCESSOR,
  );

  return (categories ?? [])
    .filter((c) =>
      typeof c?.name === "string" && c.name.length > 0 &&
      typeof c?.slug === "string" && c.slug.length > 0
    )
    .sort((a, b) => a.name.localeCompare(b.name));
};
