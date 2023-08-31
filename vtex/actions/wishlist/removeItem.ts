import wishlistLoader from "../../loaders/wishlist.ts";
import { AppContext } from "../../mod.ts";
import type { WishlistItem } from "../../utils/types.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export type Props = { id: string };

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<WishlistItem[]> => {
  const { vcs } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);
  const user = payload?.sub;
  const { id } = props;

  if (!user) {
    return [];
  }

  await vcs["POST /api/io/_v/private/graphql/v1"]({}, {
    body: {
      operationName: "RemoveFromList",
      variables: {
        name: "Wishlist",
        shopperId: user,
        id,
      },
      query:
        `mutation RemoveFromList($id: ID!, $shopperId: String!, $name: String) { removeFromList(id: $id, shopperId: $shopperId, name: $name) @context(provider: "vtex.wish-list@1.x") }`,
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
