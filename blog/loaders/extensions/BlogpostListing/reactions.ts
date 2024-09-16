import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPostListingPage } from "../../../types.ts";
import { getReactions } from "../../../utils/records.ts";

/** @title ExtensionOf BlogPostPage: Reactions */
export default function reactionsExt(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<BlogPostListingPage | null> {
  return async (blogpostListingPage: BlogPostListingPage | null) => {
    if (!blogpostListingPage) {
      return null;
    }

    const postsWithReactions = await Promise.all(
      blogpostListingPage.posts.map(async (post) => {
        const reactions = await getReactions({ post, ctx });
        return { ...post, ...reactions };
      }),
    );

    return {
      ...blogpostListingPage,
      posts: postsWithReactions,
    };
  };
}
