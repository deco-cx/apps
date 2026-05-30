import { logger } from "@deco/deco/o11y";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { BlogPost, SortBy } from "../types.ts";
import handlePosts, { slicePosts } from "../core/handlePosts.ts";
import { getRecordsByPath } from "../core/records.ts";
import { spirePostSummaryToBlogPost } from "../utils/spireImport.ts";
import { HttpError } from "../../utils/http.ts";

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
   * @description Search term override (also read from ?q= query param).
   */
  query?: string;
}

export const cache = { maxAge: 60 }; // 1 minute — balances freshness with API load

export const cacheKey = (
  props: Props,
  req: Request,
  ctx: AppContext,
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
  const spire = ctx.allowedBlogSlug ?? "native";
  return `blog-list-${spire}-p${page}-c${count}-s${slug}-${sort}-q${query}-${slugs}`;
};

/**
 * @title BlogPostList
 * @description Returns a merged list of native Deco posts and live Spire posts (when
 *   a Spire Blog Slug is configured). Spire posts are fetched in real-time from the
 *   Spire API; native posts are read from .deco/blocks. The two are merged and sorted.
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

  // 1. Native blocks posts
  const nativePosts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );

  // 2. Spire API posts — when a category filter is active, use the Spire tag
  //    endpoint so category membership is preserved for handlePosts filtering.
  const categoryFilter = typeof slug === "string" ? slug : undefined;
  const spirePosts = await fetchSpirePosts(ctx, categoryFilter);

  // 3. Merge: native takes precedence for duplicate slugs
  const merged = mergeBySlug(nativePosts, spirePosts);

  try {
    const handled = await handlePosts(
      merged,
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fetch Spire posts from the API.
 * - When categorySlug is provided: uses the tag endpoint so only posts in that
 *   category are returned, and the category is injected into each post so
 *   handlePosts' filterPostsByCategory can include them.
 * - Without categorySlug: returns the general listing (summaries, no categories).
 */
async function fetchSpirePosts(
  ctx: AppContext,
  categorySlug?: string,
): Promise<BlogPost[]> {
  const { allowedBlogSlug, spireApi } = ctx;
  if (!allowedBlogSlug || !spireApi) return [];

  try {
    if (categorySlug) {
      const { posts, tag } = await spireApi["GET /blog/:account/tags/:tagSlug"](
        { account: allowedBlogSlug, tagSlug: categorySlug },
      ).then((r) => r.json());
      const category = { name: tag?.name ?? categorySlug, slug: categorySlug };
      return (posts ?? []).map((
        p: Parameters<typeof spirePostSummaryToBlogPost>[0],
      ) => ({
        ...spirePostSummaryToBlogPost(p),
        categories: [category],
      }));
    }

    // Fetch up to 500 Spire posts — covers the vast majority of blogs.
    // For blogs >500 posts, only the first 500 Spire posts are returned.
    const { posts } = await spireApi["GET /blog/:account"](
      { account: allowedBlogSlug, perPage: 500 },
    ).then((r) => r.json());
    return (posts ?? []).map(spirePostSummaryToBlogPost);
  } catch (e) {
    // fetchSafe throws HttpError on non-2xx — treat 404 as "no posts" (not an error)
    if (e instanceof HttpError && e.status === 404) return [];
    logger.error(
      `[BlogpostList] Failed to fetch Spire posts for "${allowedBlogSlug}":`,
      e,
    );
    return [];
  }
}

/**
 * Merge two post arrays by slug, deduplicating. Native posts win on conflict.
 */
function mergeBySlug(native: BlogPost[], spire: BlogPost[]): BlogPost[] {
  const slugs = new Set(native.map((p) => p.slug));
  const unique = spire.filter((p) => !slugs.has(p.slug));
  return [...native, ...unique];
}
