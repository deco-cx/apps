import { gql } from "../../../utils/graphql.ts";
import { AppContext } from "../../mod.ts";
import { getCartCookie, setCartCookie } from "../../utils/cart.ts";
import { fragment } from "../../utils/fragments/cart.ts";
import {
  CartFragment,
  UpdateItemsMutation,
  UpdateItemsMutationVariables,
} from "../../utils/storefront.graphql.gen.ts";

type UpdateLineProps = {
  lines: Array<{
    id: string;
    quantity?: number;
  }>;
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
    UpdateItemsMutation,
    UpdateItemsMutationVariables
  >({
    variables: { cartId, lines },
    fragments: [fragment],
    query:
      gql`mutation UpdateItems($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      payload: cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...Cart }
      }
    }`,
  });

  setCartCookie(ctx.response.headers, cartId);

  return payload?.cart ?? null;
};

export default action;
