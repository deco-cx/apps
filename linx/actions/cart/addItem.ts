import type { AppContext } from "../../mod.ts";
import type { Cart } from "../../utils/types/basketJSON.ts";

interface Meta {
  PropertyMetadataID: number;
  PropertyName: string;
  Value: number;
}

export interface Props {
  ProductID: string;
  SkuID: string;
  Quantity: number;
  Metas?: Meta[];
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
