import { logger } from "@deco/deco/o11y";
import { AppContext } from "../mod.ts";
import { BlogPost, BlogPostPage } from "../types.ts";
import { getRecordsByPath } from "../core/records.ts";
import { spirePostToBlogPost } from "../utils/spireImport.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";

export interface Props {
  slug: RequestURLParam;
}

export const cache = { maxAge: 60 };

export const cacheKey = (
  props: Props,
  _req: Request,
  ctx: AppContext,
): string => {
  const spire = ctx.allowedBlogSlug ?? "native";
  return `blog-page-${spire}-${props.slug}`;
};

/**
 * @title BlogPostPage
 * @description Fetches a blog post page by slug. Checks native .deco/blocks first;
 *   if not found and Spire is configured, falls back to the Spire API in real-time.
 */
export default async function BlogPostPageLoader(
  { slug }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPostPage | null> {
  const url = new URL(req.url);

  // 1. Check native blocks first
  const posts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );
  const nativePost = posts.find((p) => p?.slug === slug);

  if (nativePost) {
    return buildPage(nativePost, url);
  }

  // 2. Fall back to Spire API when configured
  const { allowedBlogSlug, spireApi } = ctx;
  if (!allowedBlogSlug || !spireApi) return null;

  try {
    const response = await spireApi["GET /blog/:account/posts/:slug"](
      { account: allowedBlogSlug, slug },
    );
    if (!response.ok) {
      if (response.status !== 404) {
        logger.error(
          `[BlogPostPage] Spire API ${response.status} for slug "${slug}"`,
        );
      }
      return null;
    }
    const { post } = await response.json();
    if (!post) return null;
    return buildPage(spirePostToBlogPost(post), url);
  } catch (e) {
    logger.error("[BlogPostPage] Failed to fetch Spire post:", e);
    return null;
  }
}

function buildPage(post: BlogPost, url: URL): BlogPostPage {
  return {
    "@type": "BlogPostPage",
    post,
    seo: {
      title: post.seo?.title || post.title,
      description: post.seo?.description || post.excerpt,
      canonical: post.seo?.canonical || url.href,
      image: post.seo?.image || post.image,
      noIndexing: post.seo?.noIndexing || false,
    },
  };
}
