import { AppContext } from "../mod.ts";
import { BlogPost, BlogPostPage } from "../types.ts";
import { getRecordsByPath } from "../core/records.ts";
import { fetchSpireContent } from "../utils/spireImport.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";

export interface Props {
  /**
   * @title Post slug
   */
  slug: RequestURLParam;
}

export const cache = { maxAge: 60 };

export const cacheKey = (
  props: Props,
  _req: Request,
  _ctx: AppContext,
): string => `blog-page-${props.slug}`;

/**
 * @title BlogPostPage
 * @description Fetches a blog post page by slug. Native posts render the
 *   content stored in the Deco block. Spire posts fetch fresh HTML from the
 *   Spire API, falling back to the btoa-safe content stored in the block when
 *   the post is unavailable (e.g. scheduled for a future date).
 */
export default async function BlogPostPageLoader(
  { slug }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPostPage | null> {
  const url = new URL(req.url);

  const posts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );
  const post = posts.find((p) => p?.slug === slug);
  if (!post) return null;

  // For Spire posts: try to get fresh content from the Spire public API.
  // Falls back to the btoa-safe content stored in the block when the API is
  // unavailable (e.g. scheduled posts with a future publish date, or network
  // errors). fetchSpireContent returns null (not "") on failure so we can
  // distinguish "API unavailable" from "post has no content".
  let content = post.content;
  if (post.spirePostId && ctx.spireBlogSlug && slug) {
    const spireBase = (ctx.spireUrl ?? "https://spire.blog")
      .replace(/\/+$/, "")
      .replace(/\/api$/, "");
    const fresh = await fetchSpireContent(ctx.spireBlogSlug, slug, spireBase)
      .catch(() => null);
    if (fresh !== null) content = fresh; // use live API content
    // else: keep block-stored content (toLatinSafe fallback)
  }

  const fullPost: BlogPost = content !== post.content
    ? { ...post, content }
    : post;

  return {
    "@type": "BlogPostPage",
    post: fullPost,
    seo: {
      title: fullPost.seo?.title || fullPost.title,
      description: fullPost.seo?.description || fullPost.excerpt,
      canonical: fullPost.seo?.canonical || url.href,
      image: fullPost.seo?.image || fullPost.image,
      noIndexing: fullPost.seo?.noIndexing || false,
    },
  };
}
