import { gql } from "../../utils/graphql.ts";
import { AppContext } from "../mod.ts";
import { getCartCookie, setCartCookie } from "../utils/cart.ts";
import { fragment } from "../utils/graphql/fragments/checkout.ts";
import {
  CheckoutFragment,
  CreateCartMutation,
  CreateCartMutationVariables,
  GetCartQuery,
  GetCartQueryVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";

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

  const data = cartId
    ? await storefront.query<GetCartQuery, GetCartQueryVariables>({
      variables: { checkoutId: cartId },
      fragments: [fragment],
      query:
        gql`query GetCart($checkoutId: String!) { checkout(checkoutId: $checkoutId) { ...Checkout } }`,
    })
    : await storefront.query<CreateCartMutation, CreateCartMutationVariables>({
      fragments: [fragment],
      query:
        gql`mutation CreateCart { checkout: createCheckout { ...Checkout } }`,
    });

  const checkoutId = data.checkout?.checkoutId;
  setCartCookie(ctx.response.headers, checkoutId);

  return data.checkout ?? {};
};

export default loader;
