import { default as extend } from "../../website/loaders/extension.ts";
import { AppContext } from "../mod.ts";
import { handleCartImages } from "../utils/cache.ts";
import {
  getCartCookie,
  setCartCookie,
  toCartItemsWithImages,
} from "../utils/cart.ts";
import { Cart as CartFromDeco } from "../utils/client/types.ts";
import { STALE } from "../../utils/fetch.ts";

import {
  BASE_CURRENCY_CODE,
  BASE_DISCOUNT_AMOUNT,
  BASE_SHIPPING_AMOUNT,
  COUPON_CODE,
  DISCOUNT_AMOUNT,
  GRAND_TOTAL,
  SHIPPING_AMOUNT,
  SHIPPING_DISCOUNT_AMOUNT,
  SUBTOTAL,
} from "../utils/constants.ts";
import { CreateGuestCartMutation, GetCart } from "../utils/graphql/queries.ts";
import {
  CreateEmptyCartInput,
  GetCartQuery,
  GetCartQueryVariables,
  MutationCreateEmptyCartArgs,
} from "../utils/graphql/storefront.graphql.gen.ts";

export type Cart = CartFromDeco;

interface Props {
  cartId?: string;
  disableExtensions?: boolean;
}

/**
 * @title Magento Integration - Cart
 * @description Cart loader
 */
const loader = async (
  { cartId: _cartId, disableExtensions }: Props = {
    cartId: undefined,
    disableExtensions: false,
  },
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { clientAdmin, site, cartConfigs, clientGraphql } = ctx;
  const { countProductImageInCart, extensions } = cartConfigs;
  const url = new URL(req.url);
  let cartId = _cartId ?? getCartCookie(req.headers);

  console.log("cartId", cartId);

  if (!cartId) {
    console.log("Creating new cart");
    const { createEmptyCart } = await clientGraphql
      .query<MutationCreateEmptyCartArgs, CreateEmptyCartInput>({
        ...CreateGuestCartMutation,
      })
      .catch((e) => {
        console.log(e);
      });

    cartId = createEmptyCart;

    setCartCookie(ctx.response.headers, createEmptyCart);
  }

  const data = await clientGraphql
    .query<GetCartQuery, GetCartQueryVariables>(
      {
        variables: {
          cart_id: cartId,
        },
        ...GetCart,
      },
      // STALE
    )
    .catch((e) => {
      console.log(e);
    });

  console.log("data", data);

  if (!data) return null;

  const cart = data.cart;

  // const [prices, cart] = await Promise.all([
  //   clientAdmin["GET /rest/:site/V1/carts/:cartId/totals"]({
  //     cartId,
  //     site,
  //     fields: [
  //       GRAND_TOTAL,
  //       SUBTOTAL,
  //       DISCOUNT_AMOUNT,
  //       BASE_DISCOUNT_AMOUNT,
  //       SHIPPING_AMOUNT,
  //       BASE_SHIPPING_AMOUNT,
  //       SHIPPING_DISCOUNT_AMOUNT,
  //       COUPON_CODE,
  //       BASE_CURRENCY_CODE,
  //     ].join(","),
  //   }).then((totalizers) => totalizers.json()),
  //   clientAdmin["GET /rest/:site/V1/carts/:cartId"]({
  //     cartId,
  //     site,
  //   }).then((items) => items.json()),
  // ]);

  if (cart.items.length === 0) {
    return toCartItemsWithImages(
      cart,
      cart.prices,
      {
        items: [],
      },
      url.origin,
      site,
      countProductImageInCart,
    );
  }

  // const productsImages = await handleCartImages(cart, url, ctx);
  console.log("apos do handleCartImages");

  const cartWithImages = toCartItemsWithImages(
    cart,
    cart.prices,
    // productsImages,\
    cart,
    url.origin,
    site,
    countProductImageInCart,
  );

  // if (extensions && !disableExtensions) {
  //   return await extend<Cart | null>({ data: cartWithImages, extensions });
  // }

  // return cartWithImages;
  console.log("data 22", data);
  return data;
};

export default loader;
