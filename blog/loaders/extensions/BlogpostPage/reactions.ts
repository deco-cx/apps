import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPostPage } from "../../../types.ts";
import { getReactions } from "../../../utils/records.ts";

/** @title ExtensionOf BlogPostPage: Reactions */
export default function reactionsExt(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<BlogPostPage | null> {
  return async (blogpostPage: BlogPostPage | null) => {
    if (!blogpostPage) {
      return null;
    }
    const extendedPosts = await getReactions({ post: blogpostPage.post, ctx });
    return { ...blogpostPage, post: extendedPosts };
  };
}
