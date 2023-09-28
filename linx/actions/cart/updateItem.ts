import type { AppContext } from "../../mod.ts";
import type { Cart } from "../../utils/types/basketJSON.ts";

export interface Props {
  BasketItemID: number;
  Quantity: number;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const Response = props.Quantity > 0
    ? await ctx.api["POST /carrinho/alterar-quantidade"]({}, {
      body: props,
      headers: req.headers,
    }).then((res) => res.json())
    : await ctx.api["POST /carrinho/remover-produto"]({}, {
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
