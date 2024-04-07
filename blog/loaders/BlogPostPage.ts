import { AppContext } from "../mod.ts";
import { BlogPost, BlogPostPage } from "../types.ts";
import { getRecordsByPath } from "../utils/records.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";

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
  const posts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );

  const { url: baseUrl } = req;
  const url = new URL(baseUrl);

  const post = posts.find((post) => post.slug === slug);

  if (!post) {
    return null;
  }

  return {
    "@type": "BlogPostPage",
    post,
    seo: {
      title: post.title,
      description: post.excerpt,
      canonical: url.href,
    },
  };
}
