import { gql } from "../../../utils/graphql.ts";
import { HttpError } from "../../../utils/http.ts";
import { AppContext } from "../../mod.ts";
import { getCartCookie, setCartCookie } from "../../utils/cart.ts";
import { fragment } from "../../utils/graphql/fragments/checkout.ts";
import {
  CheckoutFragment,
  RemoveCouponMutation,
  RemoveCouponMutationVariables,
} from "../../utils/graphql/storefront.graphql.gen.ts";

const action = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Partial<CheckoutFragment>> => {
  const { storefront } = ctx;
  const cartId = getCartCookie(req.headers);

  if (!cartId) {
    throw new HttpError(400, "Missing cart cookie");
  }

  const data = await storefront.query<
    RemoveCouponMutation,
    RemoveCouponMutationVariables
  >({
    variables: { checkoutId: cartId },
    fragments: [fragment],
    query: gql`mutation RemoveCoupon($checkoutId: Uuid!) {
      checkout: checkoutRemoveCoupon(checkoutId: $checkoutId) {
        ...Checkout
      }
    }`,
  });

  const checkoutId = data.checkout?.checkoutId;
  setCartCookie(ctx.response.headers, checkoutId);

  return data.checkout ?? {};
};

export default action;
