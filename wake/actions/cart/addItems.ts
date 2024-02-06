import { HttpError } from "../../../utils/http.ts";
import { AppContext } from "../../mod.ts";
import { getCartCookie, setCartCookie } from "../../utils/cart.ts";
import { AddItemToCart } from "../../utils/graphql/queries.ts";
import {
  AddItemToCartMutation,
  AddItemToCartMutationVariables,
  CheckoutFragment,
} from "../../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../../utils/parseHeaders.ts";

export interface CartItem {
  productVariantId: number;
  quantity: number;
  customization?: { customizationId: number; value: string }[];
  subscription?: { subscriptionGroupId: number; recurringTypeId: number };
}

export interface Props {
  products: CartItem[];
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Partial<CheckoutFragment>> => {
  const { storefront } = ctx;
  const cartId = getCartCookie(req.headers);
  const headers = parseHeaders(req.headers);

  if (!cartId) {
    throw new HttpError(400, "Missing cart cookie");
  }

  const data = await storefront.query<
    AddItemToCartMutation,
    AddItemToCartMutationVariables
  >({
    variables: { input: { id: cartId, products: props.products } },
    ...AddItemToCart,
  }, { headers });

  const checkoutId = data.checkout?.checkoutId;

  if (cartId !== checkoutId) {
    setCartCookie(ctx.response.headers, checkoutId);
  }

  return data.checkout ?? {};
};

export default action;
