import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPost } from "../../../types.ts";
import { getReviews } from "../../../utils/records.ts";

/**
 *  @title ExtensionOf BlogPost list: Reviews
 *  @description It can harm performance. Use wisely
 */
export default function reviewsExt(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<BlogPost[] | null> {
  return async (posts: BlogPost[] | null) => {
    if (posts?.length === 0 || !posts) {
      return null;
    }

    const postsWithReviews = await Promise.all(
      posts.map(async (post) => {
        const reviews = await getReviews({ post, ctx });
        return { ...post, ...reviews };
      }),
    );

    return postsWithReviews;
  };
}
