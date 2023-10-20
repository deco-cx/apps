import { AppContext } from "../../mod.ts";
import { CheckoutFragment } from "../../utils/graphql/storefront.graphql.gen.ts";
import { CartItem as Props } from "./addItems.ts";

export type { CartItem as Props } from "./addItems.ts";

const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Partial<CheckoutFragment>> => {
  return await ctx.invoke.wake.actions.cart.addItems({ products: [props] });
};

export default action;
