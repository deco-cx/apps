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
import { getRecordsByPath } from "../utils/records.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";
const VALID_SORT_ORDERS = ["asc", "desc"];

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
  { page = 1, count = 1, slug, sortBy }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPost[] | null> {
  const url = new URL(req.url);
  const postCount = Number(count ?? url.searchParams.get("count"));
  const pageNumber = Number(page ?? url.searchParams.get("p"));
  const pageSort = sortBy ?? url.searchParams.get("sortBy") as SortBy ??
    "date_desc";
  const posts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );

  //Filter posts by category slug
  const filteredPosts = slug
    ? posts.filter(({ categories }) => categories.find((c) => c.slug === slug))
    : posts;

  if (!filteredPosts || filteredPosts.length === 0) {
    return null;
  }

  //Order posts
  const sortedPosts = sortPosts(filteredPosts, pageSort);

  const startIndex = (pageNumber - 1) * postCount;
  const endIndex = startIndex + postCount;
  const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

  return paginatedPosts.length > 0 ? paginatedPosts : null;
}

const sortPosts = (blogPosts: BlogPost[], sortOption: SortBy) => {
  const splittedSort = sortOption.split("_");
  const sortMethod = splittedSort[0] in blogPosts[0]
    ? splittedSort[0] as keyof BlogPost
    : "date";
  const sortOrder = VALID_SORT_ORDERS.includes(splittedSort[1])
    ? splittedSort[1]
    : "desc";

  return blogPosts.toSorted((a, b) => {
    if (!a[sortMethod] && !b[sortMethod]) {
      return 0; // If both posts don't have the sort method, consider them equal
    }
    if (!a[sortMethod]) {
      return 1; // If post a doesn't have sort method, put it after post b
    }
    if (!b[sortMethod]) {
      return -1; // If post b doesn't have sort method, put it after post a
    }
    const comparison = new Date(b.date).getTime() - new Date(a.date).getTime(); // Sort in descending order
    return sortOrder === "desc" ? comparison : -comparison; // Invert sort depending of desc or asc
  });
};
