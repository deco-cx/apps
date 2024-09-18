import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPostListingPage } from "../../../types.ts";
import { getReviews } from "../../../utils/records.ts";

/**
 * @title ExtensionOf BlogPostPage: Reviews
 * @description It can harm performance. Use wisely
 */
export default function reviewsExt(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<BlogPostListingPage | null> {
  return async (blogpostListingPage: BlogPostListingPage | null) => {
    if (!blogpostListingPage) {
      return null;
    }

    const posts = await Promise.all(
      blogpostListingPage.posts.map(async (post) => {
        const reviews = await getReviews({ post, ctx });
        return { ...post, ...reviews };
      }),
    );

    return {
      ...blogpostListingPage,
      posts,
    };
  };
}
