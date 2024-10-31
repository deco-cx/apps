import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { BlogPostListingPage, Ignore } from "../../../types.ts";
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
 * @title ExtensionOf BlogPostListing: Ratings
 * @description It can harm performance. Use wisely
 */
export default function ratingsExt(
  { ignoreRatings, onlyAggregate }: Props,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<BlogPostListingPage | null> {
  return async (blogpostListingPage: BlogPostListingPage | null) => {
    if (!blogpostListingPage) {
      return null;
    }

    const posts = await Promise.all(
      blogpostListingPage.posts.map(async (post) => {
        const ratings = await getRatings({
          post,
          ctx,
          onlyAggregate,
          ignoreRatings,
        });
        return { ...post, ...ratings };
      }),
    );

    return {
      ...blogpostListingPage,
      posts,
    };
  };
}
