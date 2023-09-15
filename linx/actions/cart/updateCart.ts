import { AppContext } from "../../mod.ts";
import type { Cart } from "../../utils/client.ts";

export interface Props {
  agent?: string;
  zip?: string;
  client_id?: number;
  coupon_code?: string;
  rebate_token?: string;
}

const action = (
  _props: Props,
  _req: Request,
  _ctx: AppContext,
): Promise<Cart> => {
  throw new Error("Not Implemented");

  // const { api } = ctx;
  // const cartId = getCartCookie(req.headers);

  // if (!cartId) {
  //   throw new HttpError(400, "Missing cart cookie");
  // }

  // await api["PATCH /api/v2/carts/:cartId"]({ cartId }, { body: props });

  // return cartLoader({}, req, ctx);
};

export default action;
