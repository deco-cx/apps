import { AppContext } from "../mod.ts";
import { getCartCookie, setCartCookie } from "../utils/cart.ts";
import { CreateCart, GetCart } from "../utils/storefront/queries.ts";
import {
  CreateCartMutation,
  CreateCartMutationVariables,
  GetCartQuery,
  GetCartQueryVariables,
} from "../utils/storefront/storefront.graphql.gen.ts";

const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<GetCartQuery["cart"]> => {
  const { storefront } = ctx;
  const maybeCartId = getCartCookie(req.headers);

  const cartId = maybeCartId ||
    await storefront.query<CreateCartMutation, CreateCartMutationVariables>(
      CreateCart,
    ).then((data) => data.payload?.cart?.id);

  if (!cartId) {
    throw new Error("Missing cart id");
  }

  const cart = await storefront.query<GetCartQuery, GetCartQueryVariables>({
    variables: { id: cartId },
    ...GetCart,
  }).then((data) => data.cart);

  setCartCookie(ctx.response.headers, cartId);

  return cart;
};

export default loader;
