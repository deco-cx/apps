import { AppContext } from "../../mod.ts";
import type { Cart } from "../../utils/client/types.ts";

export interface Props {
  itemId: number | string;
  quantity: number;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { client } = ctx;
  const { itemId: item_id, quantity } = props;
  const cookie = req.headers.get("cookie") ?? "";

  if (quantity > 0) {
    await client.carrinho.atualizar({ item_id, quantity }, cookie);
  } else {
    await client.carrinho.remover(item_id, cookie);
  }

  return ctx.invoke("vnda/loaders/cart.ts");
};

export default action;
