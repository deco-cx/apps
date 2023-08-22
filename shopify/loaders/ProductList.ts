import type { Product } from "../../commerce/types.ts";
import { AppContext } from "../../shopify/mod.ts";
import { toProduct } from "../utils/transform.ts";

export interface Props {
  /** @description search term to use on search */
  query: string;
  /** @description total number of items to display */
  count: number;
}

/**
 * @title Shopify Integration
 * @description Product List loader
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const { client } = ctx;

  const count = props.count ?? 12;
  const query = props.query || "";

  // search products on Shopify. Feel free to change any of these parameters
  const data = await client.products({
    first: count,
    query,
  });

  // Transform Shopify product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = data?.products.nodes.map((p) =>
    toProduct(p, p.variants.nodes[0], new URL(_req.url))
  );

  return products ?? [];
};

export default loader;
