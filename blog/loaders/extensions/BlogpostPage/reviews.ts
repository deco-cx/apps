import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPostPage } from "../../../types.ts";
import { getReviews } from "../../../utils/records.ts";

/**
 * @title ExtensionOf BlogPostPage: Reviews
 * @description It can harm performance. Use wisely
 */
export default function reviewsExt(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<BlogPostPage | null> {
  return async (blogpostPage: BlogPostPage | null) => {
    if (!blogpostPage) {
      return null;
    }
    const post = await getReviews({ post: blogpostPage.post, ctx });
    return { ...blogpostPage, post };
  };
}
