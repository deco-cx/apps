import { postViews } from "../db/schema.ts";
import { AppContext } from "../mod.ts";
import { BlogPost, SortBy, ViewFromDatabase } from "../types.ts";
import { VALID_SORT_ORDERS } from "../utils/constants.ts";

/**
 * Returns an sorted BlogPost list
 *
 * @param posts Posts to be sorted
 * @param sortBy Sort option (must be: "date_desc" | "date_asc" | "title_asc" | "title_desc" | "view_asc" | "view_desc" )
 */
export const sortPosts = async (
  blogPosts: BlogPost[],
  sortBy: SortBy,
  ctx: AppContext,
) => {
  const splittedSort = sortBy.split("_");

  if (splittedSort[0] === "view") {
    //If sort is "view_asc" or "view_desc"

    const records = await ctx.invoke.records.loaders.drizzle();
    //Deco records not installed
    if (records.__resolveType) {
      throw new Error("Deco Records not installed!");
    }

    //Get views from database
    const views = await records.select({
      id: postViews.id,
      userInteractionCount: postViews.userInteractionCount,
    }).from(postViews) as ViewFromDatabase[] | null;

    if (!views) {
      return blogPosts;
    }

    //Act like a real extension
    for (let i = 0; i < views.length; i++) {
      const view = views[i];
      const post = blogPosts.findIndex(({ slug }) => slug === view.id);

      if (blogPosts[post]) {
        blogPosts[post].interactionStatistic = {
          "@type": "InteractionCounter",
          userInteractionCount: view.userInteractionCount,
        };
      }
    }

    const sortOrder = VALID_SORT_ORDERS.includes(splittedSort[1])
      ? splittedSort[1]
      : "desc";

    //Sort and return
    return blogPosts.toSorted((a, b) => {
      const countOfA = a?.interactionStatistic?.userInteractionCount;
      const countOfB = b?.interactionStatistic?.userInteractionCount;
      if (
        !countOfA &&
        !countOfB
      ) {
        return 0;
      }

      const comparison = (countOfA ?? 0) - (countOfB ?? 0);
      return sortOrder === "desc" ? comparison : -comparison;
    });
  }

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
 * Returns an filtered BlogPost list by specific slugs
 *
 * @param posts Posts to be handled
 * @param postSlugs Specific slugs to be filter
 */
export const filterPostsBySlugs = (posts: BlogPost[], postSlugs: string[]) =>
  posts.filter(({ slug }) => postSlugs.includes(slug));

/**
 * Returns an filtered BlogPost list
 *
 * @param posts Posts to be handled
 * @param term Term to be filter
 */
export const filterPostsByTerm = (posts: BlogPost[], term: string) =>
  posts.filter(({ content, excerpt, title }) =>
    [content, excerpt, title].some((field) =>
      field.toLowerCase().includes(term.toLowerCase())
    )
  );

/**
 * Returns an filtered BlogPost list
 *
 * @param posts Posts to be handled
 * @param slug Category Slug to be filter
 */
export const filterRelatedPosts = (
  posts: BlogPost[],
  slug: string[],
) =>
  posts.filter(
    ({ categories }) => categories.find((c) => slug.includes(c.slug)),
  );

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

const filterPosts = (
  posts: BlogPost[],
  slug?: string | string[],
  postSlugs?: string[],
  term?: string,
): BlogPost[] => {
  if (typeof slug === "string") {
    const firstFilter = postSlugs && postSlugs.length > 0
      ? filterPostsBySlugs(posts, postSlugs)
      : filterPostsByCategory(posts, slug);

    const filteredByTerm = term
      ? filterPostsByTerm(firstFilter, term)
      : firstFilter;
    return filteredByTerm;
  }
  if (Array.isArray(slug)) {
    return filterRelatedPosts(posts, slug);
  }

  return posts;
};

/**
 * Returns an filtered and sorted BlogPost list. It dont slice
 *
 * @param posts Posts to be handled
 * @param sortBy Sort option (must be: "date_desc" | "date_asc" | "title_asc" | "title_desc")
 * @param ctx AppContext
 * @param slug Category slug or an array of slugs to be filtered
 * @param postSlugs Specific slugs to be filtered
 * @param term Term to be filtered
 * @param excludePostSlug Slug to be excluded
 */
export default async function handlePosts(
  posts: BlogPost[],
  sortBy: SortBy,
  ctx: AppContext,
  slug?: string | string[],
  postSlugs?: string[],
  term?: string,
  excludePostSlug?: string,
) {
  const filteredPosts = filterPosts(posts, slug, postSlugs, term).filter(
    ({ slug: postSlug }) => postSlug !== excludePostSlug,
  );

  if (!filteredPosts || filteredPosts.length === 0) {
    return null;
  }

  return await sortPosts(filteredPosts, sortBy, ctx);
}
