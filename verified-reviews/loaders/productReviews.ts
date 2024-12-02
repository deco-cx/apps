import { AppContext } from "../mod.ts";
import { Review } from "../../commerce/types.ts";
import { createClient, PaginationOptions } from "../utils/client.ts";
import { toReview } from "../utils/transform.ts";

export type Props = PaginationOptions & {
  productId: string | string[];
};

/**
 * @title Opiniões verificadas - Full Review for Product (Ratings and Reviews)
 */
export default async function productReviews(
  config: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Review[] | null> {
  const client = createClient({ ...ctx });

  if (!client) {
    return null;
  }

  const reviewsResponse = await client.reviews({
    productId: config.productId,
    count: config?.count,
    offset: config?.offset,
    order: config?.order,
  });

  const reviews = reviewsResponse?.[0];
  return reviews?.reviews?.map(toReview) ?? [];
}
