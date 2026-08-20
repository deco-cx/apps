import { AppContext } from "../mod.ts";
import { BlogPost, BlogPostPage, isPublishedStatus } from "../types.ts";
import { getRecordsByPath } from "../core/records.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";

/**
 * When truthy, a non-published post is still rendered on its single-post page
 * so the CMS editor's "See preview" can show a draft. Listings never honor
 * this — only the direct single-post URL. Previewed drafts are always
 * `noIndexing` so a leaked URL can't be indexed.
 */
const PREVIEW_PARAM = "preview";

const isPreview = (url: URL): boolean => {
  const value = url.searchParams.get(PREVIEW_PARAM);
  return value !== null && value !== "false" && value !== "0";
};

export interface Props {
  slug: RequestURLParam;
}

/**
 * @title BlogPostPage
 * @description Fetches a specific blog post page by its slug.
 *
 * @param props - Contains the slug of the blog post.
 * @param _req - The request object (unused).
 * @param ctx - The application context.
 * @returns A promise that resolves to the blog post or undefined if not found.
 */
export default async function BlogPostPageLoader(
  { slug }: Props,
  req: Request,
  ctx: AppContext,
): Promise<BlogPostPage | null> {
  const { url: baseUrl } = req;
  const url = new URL(baseUrl);
  const preview = isPreview(url);

  const posts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
    { includeUnpublished: preview },
  );

  const post = posts.find((post) => post?.slug === slug);

  if (!post) {
    return null;
  }

  return {
    "@type": "BlogPostPage",
    post,
    seo: {
      title: post?.seo?.title || post?.title,
      description: post?.seo?.description || post?.excerpt,
      canonical: post?.seo?.canonical || url.href,
      image: post?.seo?.image || post?.image,
      // A previewed/unpublished post must never be indexed, even if its URL
      // leaks — OR in the status check on top of any explicit SEO flag.
      noIndexing: post?.seo?.noIndexing || !isPublishedStatus(post.status),
    },
  };
}
