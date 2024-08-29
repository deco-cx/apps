/**
 * Retrieves a listing page of blog posts.
 *
 * @param props - The props for the blog post listing.
 * @param req - The request object.
 * @param ctx - The application context.
 * @returns A promise that resolves to an array of blog posts.
 */
import { PageInfo } from "../../commerce/types.ts";
import { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { BlogPost, BlogPostListingPage, SortBy } from "../types.ts";
import handlePosts, { slicePosts } from "../utils/handlePosts.ts";
import { getRecordsByPath } from "../utils/records.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";

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
  { page, count, slug, sortBy }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPostListingPage | null> {
  const url = new URL(req.url);
  const params = url.searchParams;
  const postsPerPage = Number(count ?? params.get("count") ?? 12);
  const pageNumber = Number(page ?? params.get("page") ?? 1);
  const pageSort = sortBy ?? params.get("sortBy") as SortBy ??
    "date_desc";
  const posts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );

  const handledPosts = handlePosts(posts, pageSort, slug);

  if (!handledPosts) {
    return null;
  }

  const slicedPosts = slicePosts(handledPosts, pageNumber, postsPerPage);

  if (slicedPosts.length === 0) {
    return null;
  }

  const category = slicedPosts[0].categories.find((c) => c.slug === slug);
  return {
    posts: slicedPosts,
    pageInfo: toPageInfo(handledPosts, postsPerPage, pageNumber, params),
    seo: {
      title: category?.name ?? "",
      canonical: new URL(url.pathname, url.origin).href,
    },
  };
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
