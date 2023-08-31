import { AppContext } from "../../mod.ts";
import type { Cart } from "../../utils/client/types.ts";
import cart from "../../loaders/cart.ts";

export interface Props {
  code: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { client } = ctx;
  const { code } = props;
  const cookie = req.headers.get("cookie") ?? "";

  const coupon = await client.coupon(code, cookie);
  const updated = await cart({}, req, ctx);

  return { coupon, ...updated };
};

export default action;
