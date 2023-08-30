import { AppContext } from "../../mod.ts";
import type { Cart } from "../../utils/client/types.ts";
import cart from "../../loaders/cart.ts";

export interface Props {
  zip: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { client } = ctx;
  const { zip } = props;

  const cookie = req.headers.get("cookie") ?? "";

  const shipping = await client.cep(zip, cookie);
  const updated = await cart({}, req, ctx);

  return { shipping, ...updated };
};

export default action;
