import wishlistLoader from "../../loaders/wishlist.ts";
import { AppContext } from "../../mod.ts";
import type { WishlistItem } from "../../utils/types.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface Props {
  productId: string;
  sku: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<WishlistItem[]> => {
  const { vcs } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);
  const user = payload?.sub;

  if (!user) {
    return [];
  }

  await vcs["POST /api/io/_v/private/graphql/v1"]({}, {
    body: {
      operationName: "AddToWishlist",
      variables: {
        name: "Wishlist",
        shopperId: user,
        listItem: props,
      },
      query:
        `mutation AddToWishlist($listItem: ListItemInputType!, $shopperId: String!, $name: String!, $public: Boolean) { addToList(listItem: $listItem, shopperId: $shopperId, name: $name, public: $public) @context(provider: "vtex.wish-list@1.x") }`,
    },
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      cookie,
    },
  });

  return wishlistLoader({ count: Infinity }, req, ctx);
};

export default action;
