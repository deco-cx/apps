import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPost } from "../../../types.ts";
import { REACTIONS_MOCK } from "../../../utils/constants.ts";

/** @title ExtensionOf BlogPost list: Reactions */
export default function reactionsExt(
  _props: unknown,
  _req: Request,
  _ctx: AppContext,
): ExtensionOf<BlogPost[] | null> {
  return (posts: BlogPost[] | null) => {
    if (posts?.length === 0 || !posts) {
      return null;
    }

    const extendedPosts = posts?.map((post) => ({
      ...post,
      reactions: REACTIONS_MOCK,
    }));

    return extendedPosts;
  };
}
