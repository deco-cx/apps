import { AppContext } from "../mod.ts";
import { BlogPost } from "../types.ts";
import { getRecordsByPath } from "../core/records.ts";
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
  _ctx: AppContext,
): string => `blog-item-${props.slug}`;

/**
 * @title BlogPostItem
 * @description Fetches a single blog post by slug from native Deco block storage.
 *   Use this for featured post components and cards. Spire posts are included
 *   automatically when synced to .deco/blocks/.
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
  return posts.find((p) => p.slug === slug) || null;
}
