import { gql } from "../../../utils/graphql.ts";
import { HttpError } from "../../../utils/http.ts";
import { AppContext } from "../../mod.ts";
import { getCartCookie, setCartCookie } from "../../utils/cart.ts";
import { fragment } from "../../utils/graphql/fragments/checkout.ts";
import {
  AddItemToCartMutation,
  AddItemToCartMutationVariables,
  CheckoutFragment,
  RemoveItemFromCartMutation,
  RemoveItemFromCartMutationVariables,
} from "../../utils/graphql/storefront.graphql.gen.ts";

export interface Props {
  productVariantId: number;
  quantity: number;
  customization: { customizationId: number; value: string }[];
  subscription: { subscriptionGroupId: number; recurringTypeId: number };
}

const addToCart = (
  props: Props,
  cartId: string,
  ctx: AppContext,
) =>
  ctx.storefront.query<
    AddItemToCartMutation,
    AddItemToCartMutationVariables
  >({
    variables: {
      input: { id: cartId, products: [props] },
    },
    fragments: [fragment],
    query:
      gql`mutation AddItemToCart($input: CheckoutProductInput!) { checkout: checkoutAddProduct(input: $input) { ...Checkout }}`,
  });

const removeFromCart = (
  props: Props,
  cartId: string,
  ctx: AppContext,
) =>
  ctx.storefront.query<
    RemoveItemFromCartMutation,
    RemoveItemFromCartMutationVariables
  >({
    variables: {
      input: { id: cartId, products: [{ ...props, quantity: 1e6 }] },
    },
    fragments: [fragment],
    query:
      gql`mutation RemoveItemFromCart($input: CheckoutProductInput!) { checkout: checkoutRemoveProduct(input: $input) { ...Checkout }}`,
  });

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Partial<CheckoutFragment>> => {
  const cartId = getCartCookie(req.headers);

  if (!cartId) {
    throw new HttpError(400, "Missing cart cookie");
  }

  let data = await removeFromCart(props, cartId, ctx);

  if (props.quantity > 0) {
    data = await addToCart(props, cartId, ctx);
  }

  const checkoutId = data.checkout?.checkoutId;
  setCartCookie(ctx.response.headers, checkoutId);

  return data.checkout ?? {};
};

export default action;
