/**
 * Retrieves a list of blog posts.
 *
 * @param props - The props for the blog post list.
 * @param req - The request object.
 * @param ctx - The application context.
 * @returns A promise that resolves to an array of blog posts.
 */
import { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { BlogPost, SortBy } from "../types.ts";
import handlePosts, { slicePosts } from "../utils/handlePosts.ts";
import { getRecordsByPath } from "../utils/records.ts";

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
  slug?: RequestURLParam;
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
): Promise<BlogPost[] | null> {
  const url = new URL(req.url);
  const postsPerPage = Number(count ?? url.searchParams.get("count"));
  const pageNumber = Number(page ?? url.searchParams.get("page") ?? 1);
  const pageSort = sortBy ?? url.searchParams.get("sortBy") as SortBy ??
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

  return slicedPosts.length > 0 ? slicedPosts : null;
}
