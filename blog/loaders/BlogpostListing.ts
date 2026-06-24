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

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";
const CATEGORIES_PATH = "collections/blog/categories";
const CATEGORY_ACCESSOR = "category";

export interface Props {
  /**
   * @title Category Slug
   * @description Filter by a specific category slug.
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
    const handledPosts = await handlePosts(
      posts,
      pageSort,
      ctx,
      slug,
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

    let categories: Category[] | null = null;
    try {
      categories = await loadCategories(ctx);
    } catch (e) {
      logger.error(e);
    }

    let category: Category | null = null;
    if (slug) {
      category = categories?.find((c) => c.slug === slug) ?? null;
      if (!category) {
        try {
          category = await loadCategoryBySlug(ctx, slug);
        } catch (e) {
          logger.error(e);
        }
      }
      category ??= slicedPosts[0]?.categories?.find((c) => c.slug === slug) ??
        null;
    }

    return {
      posts: slicedPosts,
      category,
      categories,
      pageInfo: toPageInfo(handledPosts, postsPerPage, pageNumber, params),
      seo: {
        title: category?.name ?? "",
        description: category?.description,
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

const loadCategoryBySlug = async (
  ctx: AppContext,
  slug: string,
): Promise<Category | null> => {
  const categories = await getRecordsByPath<Category>(
    ctx,
    CATEGORIES_PATH,
    CATEGORY_ACCESSOR,
  );

  return (categories ?? []).find((c) =>
    typeof c?.name === "string" && c.name.length > 0 &&
    typeof c?.slug === "string" && c.slug.length > 0 &&
    c.slug === slug
  ) ?? null;
};
