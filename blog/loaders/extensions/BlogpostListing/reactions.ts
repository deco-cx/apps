import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPostListingPage } from "../../../types.ts";
import { REACTIONS_MOCK } from "../../../utils/constants.ts";

/** @title ExtensionOf BlogPostPage: Reactions */
export default function reactionsExt(
  _props: unknown,
  _req: Request,
  _ctx: AppContext,
): ExtensionOf<BlogPostListingPage | null> {
  return (blogpostListingPage: BlogPostListingPage | null) => {
    if (!blogpostListingPage) {
      return null;
    }

    return {
      ...blogpostListingPage,
      posts: blogpostListingPage.posts.map((post) => ({
        ...post,
        reactions: REACTIONS_MOCK,
      })),
    };
  };
}
