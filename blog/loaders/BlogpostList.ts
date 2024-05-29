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

  const mostRecentPosts = posts.toSorted((a, b) => {
    if (!a.date && !b.date) {
      return 0; // If both posts don't have a date, consider them equal
    }
    if (!a.date) {
      return 1; // If post a doesn't have a date, put it after post b
    }
    if (!b.date) {
      return -1; // If post b doesn't have a date, put it after post a
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime(); // Sort by date in descending order
  });

  const page = props.page ?? 1;
  const startIndex = (page - 1) * props.count;
  const endIndex = startIndex + props.count;
  const paginatedPosts = mostRecentPosts.slice(startIndex, endIndex);

  return paginatedPosts.length > 0 ? paginatedPosts : null;
}
