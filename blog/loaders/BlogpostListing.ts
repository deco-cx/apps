import { logger } from "@deco/deco/o11y";
import { PageInfo } from "../../commerce/types.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { BlogPost, BlogPostListingPage, SortBy } from "../types.ts";
import handlePosts, { slicePosts } from "../core/handlePosts.ts";
import { getRecordsByPath } from "../core/records.ts";
import { spirePostSummaryToBlogPost } from "../utils/spireImport.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";

export interface Props {
  /**
   * @title Category slug
   * @description Filter posts by category slug.
   */
  slug?: RequestURLParam;
  /**
   * @title Items per page
   */
  count?: number;
  /**
   * @title Page number
   */
  page?: number;
  /**
   * @title Sort
   * @description Default: date_desc
   */
  sortBy?: SortBy;
  /**
   * @description Search term (also read from ?q= query param).
   */
  query?: string;
}

export const cache = { maxAge: 60 };

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
  const spire = ctx.allowedBlogSlug ?? "native";
  return `blog-listing-${spire}-p${page}-c${count}-s${slug}-${sort}`;
};

/**
 * @title BlogPostListing
 * @description Returns a paginated listing page merging native Deco posts with
 *   live Spire posts (when a Spire Blog Slug is configured).
 */
export default async function BlogPostListing(
  { page, count, slug, sortBy, query }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPostListingPage | null> {
  const url = new URL(req.url);
  const params = url.searchParams;
  const postsPerPage = Number(count ?? params.get("count") ?? 12);
  const pageNumber = Number(page ?? params.get("page") ?? 1);
  const pageSort = (sortBy ?? params.get("sortBy") ?? "date_desc") as SortBy;
  const term = query ?? params.get("q") ?? undefined;

  const nativePosts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );
  const categoryFilter = typeof slug === "string" ? slug : undefined;
  const spirePosts = await fetchSpirePosts(ctx, categoryFilter);
  const merged = mergeBySlug(nativePosts, spirePosts);

  try {
    const handled = await handlePosts(
      merged,
      pageSort,
      ctx,
      slug,
      undefined,
      term,
    );
    if (!handled) return null;

    const sliced = slicePosts(handled, pageNumber, postsPerPage);
    if (sliced.length === 0) return null;

    const category = sliced[0].categories?.find((c) => c.slug === slug);
    return {
      posts: sliced,
      pageInfo: toPageInfo(handled, postsPerPage, pageNumber, params),
      seo: {
        title: category?.name ?? "",
        canonical: new URL(url.pathname, url.origin).href,
      },
    };
  } catch (e) {
    logger.error(e);
    return null;
  }
}

async function fetchSpirePosts(
  ctx: AppContext,
  categorySlug?: string,
): Promise<BlogPost[]> {
  const { allowedBlogSlug, spireApi } = ctx;
  if (!allowedBlogSlug || !spireApi) return [];
  try {
    if (categorySlug) {
      const response = await spireApi["GET /blog/:account/tags/:tagSlug"](
        { account: allowedBlogSlug, tagSlug: categorySlug },
      );
      if (!response.ok) {
        if (response.status !== 404) {
          logger.error(
            `[BlogpostListing] Spire tag API ${response.status} for "${categorySlug}"`,
          );
        }
        return [];
      }
      const { posts, tag } = await response.json();
      const category = { name: tag?.name ?? categorySlug, slug: categorySlug };
      return (posts ?? []).map((
        p: Parameters<typeof spirePostSummaryToBlogPost>[0],
      ) => ({
        ...spirePostSummaryToBlogPost(p),
        categories: [category],
      }));
    }

    const response = await spireApi["GET /blog/:account"](
      { account: allowedBlogSlug, perPage: 100 },
    );
    if (!response.ok) {
      logger.error(
        `[BlogpostListing] Spire API ${response.status} for "${allowedBlogSlug}"`,
      );
      return [];
    }
    const { posts } = await response.json();
    return (posts ?? []).map(spirePostSummaryToBlogPost);
  } catch (e) {
    logger.error("[BlogpostListing] Failed to fetch Spire posts:", e);
    return [];
  }
}

function mergeBySlug(native: BlogPost[], spire: BlogPost[]): BlogPost[] {
  const slugs = new Set(native.map((p) => p.slug));
  return [...native, ...spire.filter((p) => !slugs.has(p.slug))];
}

const toPageInfo = (
  posts: BlogPost[],
  postsPerPage: number,
  pageNumber: number,
  params: URLSearchParams,
): PageInfo => {
  const total = posts.length;
  const totalPages = Math.ceil(total / postsPerPage);
  const hasNext = totalPages > pageNumber;
  const hasPrev = pageNumber > 1;
  const nextParams = new URLSearchParams(params);
  const prevParams = new URLSearchParams(params);
  if (hasNext) nextParams.set("page", String(pageNumber + 1));
  if (hasPrev) prevParams.set("page", String(pageNumber - 1));
  return {
    nextPage: hasNext ? `?${nextParams}` : undefined,
    previousPage: hasPrev ? `?${prevParams}` : undefined,
    currentPage: pageNumber,
    records: total,
    recordPerPage: postsPerPage,
  };
};
