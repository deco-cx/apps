import { HttpError } from "../../../utils/http.ts";
import type { AppContext } from "../../mod.ts";
import { getCartCookie, setCartCookie } from "../../utils/cart.ts";
import { RemoveItemFromCart } from "../../utils/graphql/queries.ts";
import type {
  CheckoutFragment,
  RemoveItemFromCartMutation,
  RemoveItemFromCartMutationVariables,
} from "../../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../../utils/parseHeaders.ts";

export interface Props {
  productVariantId: number;
  quantity: number;
  customization?: { customizationId: number; value: string }[];
  subscription?: { subscriptionGroupId: number; recurringTypeId: number };
}

const removeFromCart = (
  props: Props,
  cartId: string,
  ctx: AppContext,
  headers: Headers,
) =>
  ctx.storefront.query<
    RemoveItemFromCartMutation,
    RemoveItemFromCartMutationVariables
  >(
    {
      variables: {
        input: { id: cartId, products: [props] },
      },
      ...RemoveItemFromCart,
    },
    { headers },
  );

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Partial<CheckoutFragment>> => {
  const cartId = getCartCookie(req.headers);
  const headers = parseHeaders(req.headers);

  if (!cartId) {
    throw new HttpError(400, "Missing cart cookie");
  }

  /*
   * get cart
   * find the current product on cart
   * the current amount
   * calculate the difference between the current item amount and requested new amount
   */

  const cart = await ctx.invoke.wake.loaders.cart({}, req);
  const item = cart.products?.find((item) =>
    item?.productVariantId === props.productVariantId
  );
  const quantityItem = item?.quantity ?? 0;
  const quantity = props.quantity - quantityItem;

  let checkout: Partial<CheckoutFragment> | null = null;

  if (props.quantity > 0 && quantity > 0) {
    checkout = await ctx.invoke.wake.actions.cart.addItem({
      ...props,
      quantity,
    });
  } else {
    const data = await removeFromCart(
      { ...props, quantity: -quantity },
      cartId,
      ctx,
      headers,
    );
    checkout = data.checkout ?? null;
  }

  const checkoutId = checkout?.checkoutId;

  if (cartId !== checkoutId) {
    setCartCookie(ctx.response.headers, checkoutId);
  }

  return checkout ?? {};
};

export default action;
