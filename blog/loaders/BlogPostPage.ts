import { AppContext } from "../mod.ts";
import { BlogPost, BlogPostPage } from "../types.ts";
import { getRecordsByPath } from "../core/records.ts";
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
 * @description Fetches a blog post page by slug from native Deco block storage.
 *   Spire posts are included automatically when they have been synced to
 *   .deco/blocks/ via webhook or the startup/periodic reconciliation.
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
