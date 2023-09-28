import type { AppContext } from "../../mod.ts";
import type { Cart } from "../../utils/types/basketJSON.ts";

export interface Props {
  CouponCode: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const Response = await ctx.api["POST /carrinho/adicionar-cupom"]({}, {
    body: props,
    headers: req.headers,
  }).then((res) => res.json());

  const cart = await ctx.invoke("linx/loaders/cart.ts");

  return {
    ...cart,
    Response,
  };
};

export default action;
