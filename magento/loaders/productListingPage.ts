import type { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";

/* export interface Props {
 
} */

/**
 * @title Shopify Integration
 * @description Product Listing Page loader
 */
const loader = async (
  _props: unknown,
  _req: Request,
  _ctx: AppContext
): Promise<ProductListingPage | null> => {
  /* const url = new URL(req.url); */
  await 0;
  return null;
};

export default loader;
