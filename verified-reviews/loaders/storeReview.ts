import { AppContext } from "../mod.ts";
import { Review } from "../../commerce/types.ts";
import { ExtensionOf } from "../../website/loaders/extension.ts";
import {
  createClient,
  PaginationOptions,
} from "../utils/client.ts";
export type Props = PaginationOptions;

/**
 * @title Opiniões verificadas - Full Review for Product (Ratings and Reviews)
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

  if(!reviews){
    return null;
  }

  return reviews;

}
