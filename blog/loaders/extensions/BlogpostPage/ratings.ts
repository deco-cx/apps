import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPostPage, Ignore } from "../../../types.ts";
import { getRatings } from "../../../core/records.ts";

interface Props {
  /**
   * @description Ignore ratings in the aggregateRating calc
   */
  ignoreRatings?: Ignore;
}

/**
 * @title ExtensionOf BlogPostPage: Ratings
 * @description It can harm performance. Use wisely
 */
export default function ratingsExt(
  { ignoreRatings }: Props,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<BlogPostPage | null> {
  return async (blogpostPage: BlogPostPage | null) => {
    if (!blogpostPage) {
      return null;
    }
    const post = await getRatings({
      post: blogpostPage.post,
      ctx,
      ignoreRatings,
    });
    return { ...blogpostPage, post };
  };
}
