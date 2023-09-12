import { gql } from "../../../utils/graphql.ts";
import { AppContext } from "../../mod.ts";
import { getCartCookie, setCartCookie } from "../../utils/cart.ts";
import { fragment } from "../../utils/fragments/cart.ts";
import {
  AddCouponMutation,
  AddCouponMutationVariables,
  CartFragment,
} from "../../utils/storefront.graphql.gen.ts";

type AddCouponProps = {
  discountCodes: string[];
};

const action = async (
  props: AddCouponProps,
  req: Request,
  ctx: AppContext,
): Promise<CartFragment | null> => {
  const { storefront } = ctx;
  const cartId = getCartCookie(req.headers);

  if (!cartId) {
    throw new Error("Missing cart id");
  }

  const { payload } = await storefront.query<
    AddCouponMutation,
    AddCouponMutationVariables
  >({
    variables: { cartId, discountCodes: props.discountCodes },
    fragments: [fragment],
    query: gql`mutation AddCoupon($cartId: ID!, $discountCodes: [String!]!) {
      payload: cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
        cart { ...Cart }
        userErrors {
          field
          message
        }
      }
    }`,
  });

  setCartCookie(ctx.response.headers, cartId);

  return payload?.cart ?? null;
};

export default action;
