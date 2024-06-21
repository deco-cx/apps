import type { AppContext } from "../../mod.ts";
import type { CheckoutFragment } from "../../utils/graphql/storefront.graphql.gen.ts";
import type { CartItem as Props } from "./addItems.ts";

export type { CartItem as Props } from "./addItems.ts";

const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Partial<CheckoutFragment>> => {
  return await ctx.invoke.wake.actions.cart.addItems({ products: [props] });
};

export default action;
