import { logger } from "@deco/deco/o11y";
import { AppContext } from "../mod.ts";
import { BlogPost } from "../types.ts";
import { spirePostToBlogPost } from "./BlogPostPage.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";

export interface Props {
  /**
   * @title Post slug
   * @description The slug of the post to load.
   */
  slug: RequestURLParam;
}

/**
 * @title BlogPostItem
 * @description Fetches a single Spire blog post (without full page/SEO metadata).
 *   Use this for featured post components, cards, or any section that needs one post.
 */
export const cache = {
  maxAge: 60, // 1 minute — near-real-time for Spire publish
};

export const cacheKey = (props: Props, _req: Request, ctx: AppContext) => {
  return `spire-item-${encodeURIComponent(ctx.account)}-${
    encodeURIComponent(String(props.slug))
  }`;
};

export default async function BlogPostItem(
  { slug }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BlogPost | null> {
  const { account, api } = ctx;

  try {
    const response = await api["GET /blog/:account/posts/:slug"](
      { account, slug },
    );

    if (!response.ok) {
      logger.error(
        `BlogPostItem: fetch failed for slug "${slug}" — ${response.status}`,
      );
      return null;
    }

    const { post } = await response.json();
    if (!post) return null;

    return spirePostToBlogPost(post, ctx.overrideMap);
  } catch (e) {
    logger.error(`BlogPostItem: unexpected error for slug "${slug}":`, e);
    return null;
  }
}
