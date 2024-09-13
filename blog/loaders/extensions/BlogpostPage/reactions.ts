import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPostPage } from "../../../types.ts";
import { REACTIONS_MOCK } from "../../../utils/constants.ts";

/** @title ExtensionOf BlogPostPage: Reactions */
export default function reactionsExt(
  _props: unknown,
  _req: Request,
  _ctx: AppContext,
): ExtensionOf<BlogPostPage | null> {
  return (blogpostPage: BlogPostPage | null) => {
    if (!blogpostPage) {
      return null;
    }

    return {
      ...blogpostPage,
      post: {
        ...blogpostPage.post,
        reactions: REACTIONS_MOCK,
      },
    };
  };
}
