import type { AppContext } from "../../mod.ts";
import type { Cart } from "../../utils/types/basketJSON.ts";

export interface Props {
  ProductID: string;
  SkuID: string;
  Quantity: number;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const Response = await ctx.api["POST /carrinho/adicionar-produto"]({}, {
    body: { Products: [props] },
    headers: req.headers,
  }).then((res) => res.json());

  const cart = await ctx.invoke("linx/loaders/cart.ts");

  return {
    ...cart,
    Response,
  };
};

export default action;
