import { gql } from "../../../utils/graphql.ts";
import { AppContext } from "../../mod.ts";
import { getCartCookie, setCartCookie } from "../../utils/cart.ts";
import { fragment } from "../../utils/fragments/cart.ts";
import {
  AddItemToCartMutation,
  AddItemToCartMutationVariables,
  CartFragment,
} from "../../utils/storefront.graphql.gen.ts";

type UpdateLineProps = {
  lines: {
    merchandiseId: string;
    attributes?: Array<{ key: string; value: string }>;
    quantity?: number;
    sellingPlanId?: string;
  };
};

const action = async (
  { lines }: UpdateLineProps,
  req: Request,
  ctx: AppContext,
): Promise<CartFragment | null> => {
  const { storefront } = ctx;
  const cartId = getCartCookie(req.headers);

  if (!cartId) {
    throw new Error("Missing cart id");
  }

  const { payload } = await storefront.query<
    AddItemToCartMutation,
    AddItemToCartMutationVariables
  >({
    variables: { cartId, lines },
    fragments: [fragment],
    query: gql`mutation AddItemToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      payload: cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...Cart }
      }
    }`,
  });

  setCartCookie(ctx.response.headers, cartId);

  return payload?.cart ?? null;
};

export default action;
