/**
 * @title BlogRelatedPosts
 * @description Retrieves a list of blog related posts.
 *
 * @param props - The props for the blog related post list.
 * @param req - The request object.
 * @param ctx - The application context.
 * @returns A promise that resolves to an array of blog related posts.
 */
import { RequestURLParam } from "../../website/functions/requestToParam.ts";
import handlePosts, { slicePosts } from "../core/handlePosts.ts";
import { getRecordsByPath } from "../core/records.ts";
import { AppContext } from "../mod.ts";
import { BlogPost, SortBy } from "../types.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";

export interface Props {
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
   * @title Category Slug
   * @description Filter by a specific category slug.
   */
  slug?: RequestURLParam | string[];
  /**
   * @title Page sorting parameter
   * @description The sorting option. Default is "date_desc"
   */
  sortBy?: SortBy;
  /**
   * @description Overrides the query term at url
   */
  query?: string;
  /**
   * @title Exclude Post Slug
   * @description Excludes a post slug from the list
   */
  excludePostSlug?: RequestURLParam | string;
}

/**
 * @title BlogRelatedPosts
 * @description Retrieves a list of blog related posts.
 *
 * @param props - The props for the blog related post list.
 * @param req - The request object.
 * @param ctx - The application context.
 * @returns A promise that resolves to an array of blog related posts.
 */

export type BlogRelatedPosts = BlogPost[] | null;

export default async function BlogRelatedPosts(
  { page, count, slug, sortBy, query, excludePostSlug }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogRelatedPosts> {
  const url = new URL(req.url);
  const postsPerPage = Number(count ?? url.searchParams.get("count") ?? 12);
  const pageNumber = Number(page ?? url.searchParams.get("page") ?? 1);
  const pageSort = sortBy ?? (url.searchParams.get("sortBy") as SortBy) ??
    "date_desc";
  const term = query ?? url.searchParams.get("q") ?? undefined;

  const posts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );

  const handledPosts = await handlePosts(
    posts,
    pageSort,
    ctx,
    slug,
    undefined,
    term,
    excludePostSlug,
  );

  if (!handledPosts) {
    return null;
  }

  const slicedPosts = slicePosts(handledPosts, pageNumber, postsPerPage);

  return slicedPosts.length > 0 ? slicedPosts : null;
}
