import { AppContext } from "../../mod.ts";
import type { Cart } from "../../utils/client.ts";

export interface Props {
  itemId: string;
  quantity: number;
  attributes: Record<string, string>;
}

const action = (
  _props: Props,
  _req: Request,
  _ctx: AppContext,
): Promise<Cart> => {
  throw new Error("Not Implemented");

  // const { api } = ctx;
  // const { itemId, quantity, attributes } = props;
  // const cartId = getCartCookie(req.headers);

  // if (!cartId) {
  //   throw new HttpError(400, "Missing cart cookie");
  // }

  // await api["POST /web-api/v1/Shopping/Basket/AddProduct"]({ cartId }, {
  //   body: {}, // TODO:
  // });

  // return cartLoader({}, req, ctx);
};

export default action;
