/**
 * Retrieves a list of blog posts.
 *
 * @param _props - The props for the blog post list (unused).
 * @param _req - The request object (unused).
 * @param ctx - The application context.
 * @returns A promise that resolves to an array of blog posts.
 */
import { AppContext } from "../mod.ts";
import { BlogPost } from "./Blogpost.ts";
import { getRecordsByPath } from "../utils/records.ts";

const COLLECTION_PATH = "collections/blog/posts";
const ACCESSOR = "post";

/**
 * Retrieves a list of blog posts.
 *
 * @param _props - The props for the blog post list (unused).
 * @param _req - The request object (unused).
 * @param ctx - The application context.
 * @returns A promise that resolves to an array of blog posts.
 */
export default async function BlogPostList(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<BlogPost[]> {
  return await getRecordsByPath<BlogPost>(ctx, COLLECTION_PATH, ACCESSOR);
}
