import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPostPage, Ignore } from "../../../types.ts";
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
 * @title ExtensionOf BlogPostPage: Reviews
 * @description It can harm performance. Use wisely
 */
export default function reviewsExt(
  { ignoreReviews, orderBy }: Props,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<BlogPostPage | null> {
  return async (blogpostPage: BlogPostPage | null) => {
    if (!blogpostPage) {
      return null;
    }
    const post = await getReviews({
      post: blogpostPage.post,
      ctx,
      ignoreReviews,
      orderBy,
    });
    return { ...blogpostPage, post };
  };
}
