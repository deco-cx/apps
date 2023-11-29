import { AppContext } from "../mod.ts";
import { Review } from "../../commerce/types.ts";
import { createClient } from "../utils/client.ts";

export type Props = {
  /**
   * @title Number of reviews 
   */
  limit: number;
};

/**
 * @title Opiniões verificadas - Full Review for Store (Ratings and Reviews)
 */
export default async function storeReview(
  _config: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Review[] | null> {
  const client = createClient({ ...ctx });

  if (!client) {
    return null;
  }

  const reviews = await client.storeReview();

  if (!reviews) {
    return null;
  }

  const limitedReviews = reviews.slice(0, _config.limit);

  return limitedReviews;
}
