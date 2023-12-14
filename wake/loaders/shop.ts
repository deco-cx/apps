import type { AppContext } from "../mod.ts";
import { Shop } from "../utils/graphql/queries.ts";
import {
  ShopQuery,
  ShopQueryVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";

/**
 * @title Wake Integration - Shop Infos
 * @description Shop Infos loader
 */
const shopInfos = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<ShopQuery["shop"] | undefined> => {
  const { storefront } = ctx;

  const headers = parseHeaders(req.headers);

  const data = await storefront.query<
    ShopQuery,
    ShopQueryVariables
  >({
    ...Shop,
  }, { headers });

  return data.shop ?? undefined;
};

export default shopInfos;
