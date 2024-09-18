import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPost } from "../../../types.ts";
import { getRatings } from "../../../utils/records.ts";

/**
 * @title ExtensionOf BlogPost list: Ratings
 * @description It can harm performance. Use wisely
 */
export default function ratingsExt(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<BlogPost[] | null> {
  return async (posts: BlogPost[] | null) => {
    if (posts?.length === 0 || !posts) {
      return null;
    }

    const postsWithRatings = await Promise.all(
      posts.map(async (post) => {
        const ratings = await getRatings({ post, ctx });
        return { ...post, ...ratings };
      }),
    );

    return postsWithRatings;
  };
}
