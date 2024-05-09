import { AppContext } from "../../mod.ts";
import { getCartCookie } from "../../utils/cart.ts";
import { Cart } from "../../loaders/cart.ts";

export interface Props {
  itemId: string;
}

const action = async (
  { itemId }: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { clientAdmin, site } = ctx;
  const cartId = getCartCookie(req.headers);

  await clientAdmin["DELETE /rest/:site/V1/carts/:cartId/items/:itemId"]({
    site,
    cartId: cartId,
    itemId,
  }, {});

  return await clientAdmin["GET /rest/:site/V1/carts/:cartId"]({
    cartId: cartId,
    site: ctx.site,
  }).then((res) => res.json());
};

export default action;
