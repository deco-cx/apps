import { AppContext } from "../mod.ts";
import { getCartCookie, setCartCookie } from "../utils/cart.ts";
import { CreateCart, GetCart } from "../utils/graphql/queries.ts";
import {
  CheckoutFragment,
  CreateCartMutation,
  CreateCartMutationVariables,
  GetCartQuery,
  GetCartQueryVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";

/**
 * @title VNDA Integration
 * @description Cart loader
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Partial<CheckoutFragment>> => {
  const { storefront } = ctx;
  const cartId = getCartCookie(req.headers);
  const headers = parseHeaders(req.headers);

  const data = cartId
    ? await storefront.query<GetCartQuery, GetCartQueryVariables>({
      variables: { checkoutId: cartId },
      ...GetCart,
    }, {
      headers,
    })
    : await storefront.query<CreateCartMutation, CreateCartMutationVariables>({
      ...CreateCart,
    }, {
      headers,
    });

  const checkoutId = data.checkout?.checkoutId;

  if (cartId !== checkoutId) {
    setCartCookie(ctx.response.headers, checkoutId);
  }

  return data.checkout ?? {};
};

export default loader;
