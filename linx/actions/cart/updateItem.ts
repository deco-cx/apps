import { AppContext } from "../../mod.ts";
import { Cart } from "../../utils/client.ts";

export interface Props {
  itemId: number | string;
  quantity: number;
}

const action = (
  _props: Props,
  _req: Request,
  _ctx: AppContext,
): Promise<Cart> => {
  throw new Error("Not Implemented");
  // const { api } = ctx;
  // const { itemId, quantity } = props;
  // const cartId = getCartCookie(req.headers);

  // if (!cartId) {
  //   throw new HttpError(400, "Missing cart cookie");
  // }

  // if (quantity > 0) {
  //   await api["PATCH /api/v2/carts/:cartId/items/:itemId"]({ cartId, itemId }, {
  //     body: { quantity },
  //   });
  // } else {
  //   await api["DELETE /api/v2/carts/:cartId/items/:itemId"]({ cartId, itemId });
  // }

  // return cartLoader({}, req, ctx);
};

export default action;
