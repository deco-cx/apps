import { AppContext } from "../mod.ts";
import type { WishlistItem } from "../utils/types.ts";
import { parseCookie } from "../utils/vtexId.ts";

export interface Props {
  /**
   * @title Items per page
   * @description Number of products per page to display
   * @default 12
   */
  count?: number;

  /** @description disable pagination and return all records */
  allRecords?: boolean;
}

const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<WishlistItem[]> => {
  const { io } = ctx;
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page")) || 0;
  const count = props.count || Infinity;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);
  const user = payload?.sub;

  if (!user) {
    return [];
  }

  try {
    const { viewList } = await io.query<
      { viewList: { name?: string; data: WishlistItem[] } },
      { name: string; shopperId: string }
    >({
      operationName: "GetWithlist",
      variables: {
        name: "Wishlist",
        shopperId: user,
      },
      query:
        `query GetWithlist($shopperId: String!, $name: String!, $from: Int, $to: Int) { viewList(shopperId: $shopperId, name: $name, from: $from, to: $to) @context(provider: "vtex.wish-list@1.x") { name data { id productId sku title } } }`,
    }, {
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        cookie,
      },
    });

    if (props.allRecords) {
      return viewList.data ?? [];
    }

    return viewList.data?.slice(count * page, count * (page + 1)) ?? [];
  } catch {
    return [];
  }
};

export default loader;
