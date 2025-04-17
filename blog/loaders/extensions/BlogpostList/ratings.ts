import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPost, Ignore } from "../../../types.ts";
import { getRatings } from "../../../core/records.ts";

interface Props {
  /**
   * @description Ignore ratings in the aggregateRating calc
   */
  ignoreRatings?: Ignore;
  /**
   * @description Return only aggregate rating object
   */
  onlyAggregate?: boolean;
}

/**
 * @title ExtensionOf BlogPost list: Ratings
 * @description It can harm performance. Use wisely
 */
export default function ratingsExt(
  { ignoreRatings, onlyAggregate }: Props,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<BlogPost[] | null> {
  return async (posts: BlogPost[] | null) => {
    if (posts?.length === 0 || !posts) {
      return null;
    }

    const postsWithRatings = await Promise.all(
      posts.map(async (post) => {
        const ratings = await getRatings({
          post,
          ctx,
          ignoreRatings,
          onlyAggregate,
        });
        return { ...post, ...ratings };
      }),
    );

    return postsWithRatings;
  };
}
