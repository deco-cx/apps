import { AppContext } from "../../mod.ts";
import { CheckoutFragment } from "../../utils/graphql/storefront.graphql.gen.ts";
import AddItems, { CartItem as Props } from "./addItems.ts";

export type { CartItem as Props } from "./addItems.ts";

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Partial<CheckoutFragment>> => {
  return await AddItems({ products: [props] }, req, ctx);
};

export default action;
