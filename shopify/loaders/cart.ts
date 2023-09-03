import { AppContext } from "../mod.ts";
import { getCartCookie, setCartCookie } from "../utils/cart.ts";
import {
  Data as CartData,
  query as getCart,
  Variables as CartVariables,
} from "../utils/queries/cart.ts";
import {
  Data as CreateCartData,
  query as createCart,
  Variables as CreateVariablesData,
} from "../utils/queries/createCart.ts";

const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<CartData["cart"]> => {
  const { storefront } = ctx;
  const maybeCartId = getCartCookie(req.headers);

  const cartId = maybeCartId ||
    await storefront.query<CreateCartData, CreateVariablesData>({
      query: createCart,
    }).then((data) => data.payload.cart.id);

  if (!cartId) {
    throw new Error("Missing cart id");
  }

  const cart = await storefront.query<CartData, CartVariables>({
    query: getCart,
    variables: { id: cartId },
  }).then((data) => data.cart);

  setCartCookie(ctx.response.headers, cartId);

  return cart;
};

export default loader;
