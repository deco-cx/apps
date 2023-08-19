import { fetchAPI } from "../../utils/fetch.ts";
import { AppContext } from "../mod.ts";
import { paths } from "../utils/paths.ts";
import type { WishlistItem } from "../utils/types.ts";
import { parseCookie } from "../utils/vtexId.ts";

export interface Props {
  /**
   * @title Items per page
   * @description Number of products per page to display
   * @default 12
   */
  count: number;
}

const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<WishlistItem[]> => {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page")) || 0;
  const count = props.count || Infinity;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);
  const user = payload?.sub;

  if (!user) {
    return [];
  }

  try {
    const { data } = await fetchAPI<
      { data?: { viewList: { name?: string; data: WishlistItem[] } } }
    >(
      `${paths(ctx).api.io._v.private.graphql.v1}`,
      {
        method: "POST",
        body: JSON.stringify({
          operationName: "GetWithlist",
          variables: {
            name: "Wishlist",
            shopperId: user,
          },
          query:
            `query GetWithlist($shopperId: String!, $name: String!, $from: Int, $to: Int) { viewList(shopperId: $shopperId, name: $name, from: $from, to: $to) @context(provider: "vtex.wish-list@1.x") { name data { id productId sku title } } }`,
        }),
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          cookie,
        },
      },
    );

    return data?.viewList.data?.slice(count * page, count * (page + 1)) ?? [];
  } catch {
    return [];
  }
};

export default loader;
