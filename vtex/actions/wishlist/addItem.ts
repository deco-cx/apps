import { paths } from "apps/vtex/utils/paths.ts";
import { parseCookie } from "apps/vtex/utils/vtexId.ts";
import wishlistLoader from "apps/vtex/loaders/wishlist.ts";
import { fetchAPI } from "apps/utils/fetch.ts";
import type { WishlistItem } from "apps/vtex/utils/types.ts";
import { AppContext } from "apps/vtex/mod.ts";

export interface Props {
  productId: string;
  sku: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<WishlistItem[]> => {
  const { cookie, payload } = parseCookie(req.headers, ctx.account);
  const user = payload?.sub;

  if (!user) {
    return [];
  }

  await fetchAPI(
    `${paths(ctx).api.io._v.private.graphql.v1}`,
    {
      method: "POST",
      body: JSON.stringify({
        operationName: "AddToWishlist",
        variables: {
          name: "Wishlist",
          shopperId: user,
          listItem: props,
        },
        query:
          `mutation AddToWishlist($listItem: ListItemInputType!, $shopperId: String!, $name: String!, $public: Boolean) { addToList(listItem: $listItem, shopperId: $shopperId, name: $name, public: $public) @context(provider: "vtex.wish-list@1.x") }`,
      }),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        cookie,
      },
    },
  );

  return wishlistLoader({ count: Infinity }, req, ctx);
};

export default action;
