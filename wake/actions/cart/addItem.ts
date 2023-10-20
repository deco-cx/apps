import { AppContext } from "../../mod.ts";
import { CheckoutFragment } from "../../utils/graphql/storefront.graphql.gen.ts";
import AddItems, { CartItem as Props } from "./addItems.ts";

export type { CartItem as Props } from "./addItems.ts";

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Partial<CheckoutFragment>> => {
  return await ctx.invoke.wake.actions.cart.addItem({ products: [props] });
};

export default action;
