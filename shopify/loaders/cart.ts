import { gql } from "../../utils/graphql.ts";
import { AppContext } from "../mod.ts";
import { getCartCookie, setCartCookie } from "../utils/cart.ts";
import { fragment } from "../utils/fragments/cart.ts";
import {
  CreateCartMutation,
  CreateCartMutationVariables,
  GetCartQuery,
  GetCartQueryVariables,
} from "../utils/storefront.graphql.gen.ts";

const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<GetCartQuery["cart"]> => {
  const { storefront } = ctx;
  const maybeCartId = getCartCookie(req.headers);

  const cartId = maybeCartId ||
    await storefront.query<CreateCartMutation, CreateCartMutationVariables>({
      query: gql`mutation CreateCart {
        payload: cartCreate { 
          cart { id } 
        }
      }`,
    }).then((data) => data.payload?.cart?.id);

  if (!cartId) {
    throw new Error("Missing cart id");
  }

  const cart = await storefront.query<GetCartQuery, GetCartQueryVariables>({
    variables: { id: cartId },
    fragments: [fragment],
    query: gql`query GetCart($id: ID!) { cart(id: $id) { ...Cart } }`,
  }).then((data) => data.cart);

  setCartCookie(ctx.response.headers, cartId);

  return cart;
};

export default loader;
