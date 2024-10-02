import { BlogPost, SortBy } from "../types.ts";
import { VALID_SORT_ORDERS } from "./constants.ts";

/**
 * Returns an sorted BlogPost list
 *
 * @param posts Posts to be sorted
 * @param sortBy Sort option (must be: "date_desc" | "date_asc" | "title_asc" | "title_desc" )
 */
export const sortPosts = (blogPosts: BlogPost[], sortBy: SortBy) => {
  const splittedSort = sortBy.split("_");

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
    const comparison = sortMethod === "date"
      ? new Date(b.date).getTime() -
        new Date(a.date).getTime()
      : a[sortMethod]?.toString().localeCompare(
        b[sortMethod]?.toString() ?? "",
      ) ?? 0;
    return sortOrder === "desc" ? comparison : -comparison; // Invert sort depending of desc or asc
  });
};

/**
 * Returns an filtered BlogPost list
 *
 * @param posts Posts to be handled
 * @param slug Category Slug to be filter
 */
export const filterPostsByCategory = (posts: BlogPost[], slug?: string) =>
  slug
    ? posts.filter(({ categories }) => categories.find((c) => c.slug === slug))
    : posts;

/**
 * Returns an filtered and sorted BlogPost list
 *
 * @param posts Posts to be handled
 * @param pageNumber Actual page number
 * @param postsPerPage Number of posts per page
 */
export const slicePosts = (
  posts: BlogPost[],
  pageNumber: number,
  postsPerPage: number,
) => {
  const startIndex = (pageNumber - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  return posts.slice(startIndex, endIndex);
};

/**
 * Returns an filtered and sorted BlogPost list. It dont slice
 *
 * @param posts Posts to be handled
 * @param sortBy Sort option (must be: "date_desc" | "date_asc" | "title_asc" | "title_desc" )
 * @param slug Category slug to be filter
 */
export default function handlePosts(
  posts: BlogPost[],
  sortBy: SortBy,
  slug?: string,
) {
  const filteredPosts = filterPostsByCategory(posts, slug);

  if (!filteredPosts || filteredPosts.length === 0) {
    return null;
  }

  return sortPosts(filteredPosts, sortBy);
}
