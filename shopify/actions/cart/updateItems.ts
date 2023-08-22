import { getCookies } from "std/http/mod.ts";
import { AppContext } from "../../mod.ts";
import { SHOPIFY_COOKIE_NAME } from "../../utils/constants.ts";
import type { Cart } from "../../utils/types.ts";

export interface updateCartQueryProps {
  cartLinesUpdate: Cart;
}

type UpdateLineProps = {
  lines: {
    id: string;
    quantity?: number;
  };
};

const action = async (
  props: UpdateLineProps,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { client } = ctx;

  const reqCookies = getCookies(req.headers);
  const cartId = reqCookies[SHOPIFY_COOKIE_NAME];
  const response: updateCartQueryProps | undefined = await client.cart
    .updateItems({
      cartId: cartId,
      lines: [props.lines],
    });

  return response?.cartLinesUpdate || { cart: { id: cartId } };
};

export default action;
