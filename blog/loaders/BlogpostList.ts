/**
 * Retrieves a list of blog posts.
 *
 * @param _props - The props for the blog post list (unused).
 * @param _req - The request object (unused).
 * @param ctx - The application context.
 * @returns A promise that resolves to an array of blog posts.
 */
import { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { BlogPost } from "../types.ts";
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
  { page = 1, count = 1, slug }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPost[] | null> {
  const url = new URL(req.url);
  const postCount = Number(count ?? url.searchParams.get("count"));
  const pageNumber = Number(page ?? url.searchParams.get("p"));
  const posts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );

  //Filter posts by category slug
  const filteredPosts = slug
    ? posts.filter(({ categories }) => categories.find((c) => c.slug === slug))
    : posts;

  const mostRecentPosts = filteredPosts.toSorted((a, b) => {
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

  const startIndex = (pageNumber - 1) * postCount;
  const endIndex = startIndex + postCount;
  const paginatedPosts = mostRecentPosts.slice(startIndex, endIndex);

  return paginatedPosts.length > 0 ? paginatedPosts : null;
}
