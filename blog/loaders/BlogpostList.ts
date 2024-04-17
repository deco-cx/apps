/**
 * Retrieves a list of blog posts.
 *
 * @param _props - The props for the blog post list (unused).
 * @param _req - The request object (unused).
 * @param ctx - The application context.
 * @returns A promise that resolves to an array of blog posts.
 */
import { AppContext } from "../mod.ts";
import { BlogPost } from "../types.ts";
import { getRecordsByPath } from "../utils/records.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";

export interface Props {
  /**
   * @title Items per page
   * @description Number of posts per page to display.
   */
  count: number;
  /**
   * @title Page query parameter
   * @description The current page number. Defaults to 1.
   */
  page?: number;
}

/**
 * @title BlogPostList
 * @description Retrieves a list of blog posts.
 *
 * Retrieves a list of blog posts.
 *
 * @param _props - The props for the blog post list (unused).
 * @param _req - The request object (unused).
 * @param ctx - The application context.
 * @returns A promise that resolves to an array of blog posts.
 */
export default async function BlogPostList(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BlogPost[] | null> {
  const posts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );

  const page = props.page ?? 1;
  const startIndex = (page - 1) * props.count;
  const endIndex = startIndex + props.count;
  const paginatedPosts = posts.slice(startIndex, endIndex);

  return paginatedPosts.length > 0 ? paginatedPosts : null;
}
