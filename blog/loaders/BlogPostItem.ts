import { logger } from "@deco/deco/o11y";
import { AppContext } from "../mod.ts";
import { BlogPost } from "../types.ts";
import { getRecordsByPath } from "../core/records.ts";
import { spirePostToBlogPost } from "../utils/spireImport.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";

export interface Props {
  /**
   * @title Post slug
   * @description Slug of the post to retrieve.
   */
  slug: RequestURLParam;
}

export const cache = { maxAge: 60 };

export const cacheKey = (
  props: Props,
  _req: Request,
  ctx: AppContext,
): string => {
  const spire = ctx.allowedBlogSlug ?? "native";
  return `blog-item-${spire}-${props.slug}`;
};

/**
 * @title BlogPostItem
 * @description Fetches a single blog post by slug. Checks native .deco/blocks first;
 *   falls back to Spire API when configured and post is not found locally.
 */
export default async function BlogPostItem(
  { slug }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BlogPost | null> {
  // 1. Native blocks
  const posts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );
  const native = posts.find((p) => p.slug === slug);
  if (native) return native;

  // 2. Spire API fallback
  const { allowedBlogSlug, spireApi } = ctx;
  if (!allowedBlogSlug || !spireApi) return null;

  try {
    const response = await spireApi["GET /blog/:account/posts/:slug"](
      { account: allowedBlogSlug, slug },
    );
    if (!response.ok) return null;
    const { post } = await response.json();
    return post ? spirePostToBlogPost(post) : null;
  } catch (e) {
    logger.error("[BlogPostItem] Failed to fetch Spire post:", e);
    return null;
  }
}
