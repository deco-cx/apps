import { logger } from "@deco/deco/o11y";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { BlogPost, SortBy } from "../types.ts";
import handlePosts, { slicePosts } from "../core/handlePosts.ts";
import { getRecordsByPath } from "../core/records.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";

export interface Props {
  /**
   * @title Items per page
   * @description Number of posts per page to display.
   */
  count?: number;
  /**
   * @title Page number
   * @description The current page number. Defaults to 1.
   */
  page?: number;
  /**
   * @title Category slug
   * @description Filter posts by category slug.
   */
  slug?: RequestURLParam;
  /**
   * @title Specific post slugs
   * @description Return only these post slugs.
   */
  postSlugs?: string[];
  /**
   * @title Sort
   * @description Sorting option. Default: date_desc
   */
  sortBy?: SortBy;
  /**
   * @title Search term
   * @description Full-text search across title, excerpt, and content.
   *   Also read from the ?q= query parameter.
   */
  query?: string;
}

export const cache = { maxAge: 60 };

export const cacheKey = (
  props: Props,
  req: Request,
  _ctx: AppContext,
): string => {
  const url = new URL(req.url);
  const page = Number(props.page ?? url.searchParams.get("page") ?? 1);
  const count = Number(props.count ?? url.searchParams.get("count") ?? 12);
  const slug = String(props.slug ?? url.searchParams.get("slug") ?? "");
  const sort = String(
    props.sortBy ?? url.searchParams.get("sortBy") ?? "date_desc",
  );
  const query = String(props.query ?? url.searchParams.get("q") ?? "");
  const slugs = JSON.stringify(props.postSlugs ?? []);
  return `blog-list-p${page}-c${count}-s${slug}-${sort}-q${query}-${slugs}`;
};

/**
 * @title BlogPostList
 * @description Returns a list of blog posts from native Deco block storage.
 *   Spire posts are included automatically when they have been synced to
 *   .deco/blocks/ via webhook or the startup/periodic reconciliation.
 *   Always returns a normalized BlogPost[] regardless of origin — the `source`
 *   field discriminates native vs Spire at runtime.
 */
export default async function BlogPostList(
  { page, count, slug, sortBy, postSlugs, query }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPost[] | null> {
  const url = new URL(req.url);
  const postsPerPage = Number(count ?? url.searchParams.get("count") ?? 12);
  const pageNumber = Number(page ?? url.searchParams.get("page") ?? 1);
  const pageSort =
    (sortBy ?? url.searchParams.get("sortBy") ?? "date_desc") as SortBy;
  const term = query ?? url.searchParams.get("q") ?? undefined;

  const posts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );

  try {
    const handled = await handlePosts(
      posts,
      pageSort,
      ctx,
      slug,
      postSlugs,
      term,
    );
    if (!handled) return null;
    const sliced = slicePosts(handled, pageNumber, postsPerPage);
    return sliced.length > 0 ? sliced : null;
  } catch (e) {
    logger.error(e);
    return null;
  }
}
