import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPostListingPage } from "../../../types.ts";
import { getRatings } from "../../../utils/records.ts";

/**
 * @title ExtensionOf BlogPostPage: Ratings
 * @description It can harm performance. Use wisely
 */
export default function ratingsExt(
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
        const ratings = await getRatings({ post, ctx });
        return { ...post, ...ratings };
      }),
    );

    return {
      ...blogpostListingPage,
      posts,
    };
  };
}
