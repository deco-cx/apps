/**
 * Retrieves a list of blog posts.
 *
 * @param props - The props for the blog post list.
 * @param req - The request object.
 * @param ctx - The application context.
 * @returns A promise that resolves to an array of blog posts.
 */
import { logger } from "@deco/deco/o11y";
import { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { BlogPost, SortBy } from "../types.ts";
import handlePosts, { slicePosts } from "../core/handlePosts.ts";
import { getRecordsByPath } from "../core/records.ts";
import { descendantSlugs } from "../core/categoryTree.ts";
import { Category } from "../types.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";
const CATEGORIES_PATH = "collections/blog/categories";
const CATEGORY_ACCESSOR = "category";

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
   * @description Filter by a category slug. May be a full path
   * ("parent/child"); posts of every subcategory below the last segment are
   * included.
   */
  slug?: RequestURLParam;
  /**
   * @title Specific post slugs
   * @description Filter by specific post slugs.
   */
  postSlugs?: string[];
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
  { page, count, slug, sortBy, postSlugs, query }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPost[] | null> {
  const url = new URL(req.url);
  const postsPerPage = Number(count ?? url.searchParams.get("count") ?? 12);
  const pageNumber = Number(page ?? url.searchParams.get("page") ?? 1);
  const pageSort = sortBy ?? url.searchParams.get("sortBy") as SortBy ??
    "date_desc";
  const term = query ?? url.searchParams.get("q") ?? undefined;

  const posts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );

  try {
    // A parent category also lists its descendants' posts, so the slug expands
    // into the whole subtree below it.
    const leafSlug = (slug ?? "").split("/").filter(Boolean).pop();
    let categorySlugs: string | string[] | undefined = leafSlug;

    if (leafSlug && !postSlugs?.length) {
      try {
        const categories = await getRecordsByPath<Category>(
          ctx,
          CATEGORIES_PATH,
          CATEGORY_ACCESSOR,
        );
        categorySlugs = descendantSlugs(leafSlug, categories);
      } catch (e) {
        logger.error(e);
      }
    }

    const handledPosts = await handlePosts(
      posts,
      pageSort,
      ctx,
      categorySlugs,
      postSlugs,
      term,
    );

    if (!handledPosts) {
      return null;
    }

    const slicedPosts = slicePosts(handledPosts, pageNumber, postsPerPage);

    return slicedPosts.length > 0 ? slicedPosts : null;
  } catch (e) {
    logger.error(e);
    return null;
  }
}
