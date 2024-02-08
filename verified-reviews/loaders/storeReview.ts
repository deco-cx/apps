import { Review } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { createClient } from "../utils/client.ts";
import { toReview } from "../utils/transform.ts";

export type Props = {
  /**
   * @title Number of reviews
   * @default 5
   */
  limit?: number;
  /**
   * @title Offset
   * @default 0
   */
  offset?: number;
};

/**
 * @title Opiniões verificadas - Full Review for Store (Ratings and Reviews)
 */
export default async function storeReview(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Review[] | null> {
  const { offset = 0, limit = 5 } = props;
  const client = createClient({ ...ctx });

  if (!client) {
    return null;
  }

  const reviews = await client.storeReview();

  if (!reviews) {
    return null;
  }

  // The API does not have a pagination, so we need to do it here
  return reviews.map(toReview).slice(offset, limit);
}
