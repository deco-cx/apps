import { AppContext } from "../../mod.ts";
import { getCartCookie, setCartCookie } from "../../utils/cart.ts";
import { CartBuyerIdentityUpdate } from "../../utils/storefront/queries.ts";
import {
  CartFragment,
  CartBuyerIdentityUpdatePayload,
  MutationCartBuyerIdentityUpdateArgs,
  CartBuyerIdentityInput,
} from "../../utils/storefront/storefront.graphql.gen.ts";

const action = async (
  props: CartBuyerIdentityInput,
  req: Request,
  ctx: AppContext,
): Promise<CartFragment | null> => {
  const { storefront } = ctx;
  const cartId = getCartCookie(req.headers);

  if (!cartId) {
    throw new Error("Missing cart id");
  }

  const { cartBuyerIdentityUpdate } = await storefront.query<
    { cartBuyerIdentityUpdate: CartBuyerIdentityUpdatePayload },
    MutationCartBuyerIdentityUpdateArgs
  >({
    variables: { cartId, buyerIdentity: props },
    ...CartBuyerIdentityUpdate,
  });

  setCartCookie(ctx.response.headers, cartId);

  return cartBuyerIdentityUpdate.cart ?? null;
};

export default action;
