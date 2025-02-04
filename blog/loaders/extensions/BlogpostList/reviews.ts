import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPost, Ignore } from "../../../types.ts";
import { getReviews } from "../../../core/records.ts";

interface Props {
  /**
   * @description Ignore specific reviews
   */
  ignoreReviews?: Ignore;
  /**
   * @description Order By
   */
  orderBy?: "date_asc" | "date_desc";
}

/**
 *  @title ExtensionOf BlogPost list: Reviews
 *  @description It can harm performance. Use wisely
 */
export default function reviewsExt(
  { ignoreReviews, orderBy }: Props,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<BlogPost[] | null> {
  return async (posts: BlogPost[] | null) => {
    if (posts?.length === 0 || !posts) {
      return null;
    }

    const postsWithReviews = await Promise.all(
      posts.map(async (post) => {
        const reviews = await getReviews({ post, ctx, ignoreReviews, orderBy });
        return { ...post, ...reviews };
      }),
    );

    return postsWithReviews;
  };
}
