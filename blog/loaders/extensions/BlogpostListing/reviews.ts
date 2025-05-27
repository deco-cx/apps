import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPostListingPage, Ignore } from "../../../types.ts";
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
 * @title ExtensionOf BlogPostListing: Reviews
 * @description It can harm performance. Use wisely
 */
export default function reviewsExt(
  { ignoreReviews, orderBy }: Props,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<BlogPostListingPage | null> {
  return async (blogpostListingPage: BlogPostListingPage | null) => {
    if (!blogpostListingPage) {
      return null;
    }

    const posts = await Promise.all(
      blogpostListingPage.posts.map(async (post) => {
        const reviews = await getReviews({ post, ctx, ignoreReviews, orderBy });
        return { ...post, ...reviews };
      }),
    );

    return {
      ...blogpostListingPage,
      posts,
    };
  };
}
