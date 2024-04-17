import { AppContext } from "../mod.ts";
import { BlogPost } from "../types.ts";
import { getRecordsByPath } from "../utils/records.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";

export interface Props {
  slug: RequestURLParam;
}

/**
 * @title BlogPostItem
 * @description Fetches a specific blog post by its slug.
 *
 * Fetches a specific blog post by its slug.
 *
 * @param props - Contains the slug of the blog post.
 * @param _req - The request object (unused).
 * @param ctx - The application context.
 * @returns A promise that resolves to the blog post or undefined if not found.
 */
export default async function BlogPostItem(
  { slug }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BlogPost | null> {
  const posts = await getRecordsByPath<BlogPost>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );

  return posts.find((post) => post.slug === slug) || null;
}
