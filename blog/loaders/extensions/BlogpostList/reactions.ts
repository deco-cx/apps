import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPost } from "../../../types.ts";
import { getReactions } from "../../../utils/records.ts";

/** @title ExtensionOf BlogPost list: Reactions */
export default function reactionsExt(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<BlogPost[] | null> {
  return async (posts: BlogPost[] | null) => {
    if (posts?.length === 0 || !posts) {
      return null;
    }

    const postsWithReactions = await Promise.all(
      posts.map(async (post) => {
        const reactions = await getReactions({ post, ctx });
        return { ...post, ...reactions };
      }),
    );

    return postsWithReactions;
  };
}
