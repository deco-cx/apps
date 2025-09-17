import { AppContext } from "../../mod.ts";
import type { WishlistItem } from "../../utils/types.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface Props {
  productId: string;
  sku: string;
}

/**
 * @title Add Item to Wishlist
 * @description Add an item to the wishlist
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<WishlistItem[]> => {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);
  const user = payload?.sub;

  if (!user) {
    return [];
  }

  await io.query({
    operationName: "AddToWishlist",
    variables: {
      name: "Wishlist",
      shopperId: user,
      listItem: props,
    },
    query:
      `mutation AddToWishlist($listItem: ListItemInputType!, $shopperId: String!, $name: String!, $public: Boolean) { addToList(listItem: $listItem, shopperId: $shopperId, name: $name, public: $public) @context(provider: "vtex.wish-list@1.x") }`,
  }, { headers: { cookie } });

  return ctx.invoke.vtex.loaders.wishlist({ allRecords: true });
};

export default action;
