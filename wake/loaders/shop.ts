import type { AppContext } from "../mod.ts";
import { handleAuthError } from "../utils/authError.ts";
import { Shop } from "../utils/graphql/queries.ts";
import {
  ShopQuery,
  ShopQueryVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import { getPartnerCookie } from "../utils/partner.ts";

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

  let data: ShopQuery | undefined;
  try {
    data = await storefront.query<
      ShopQuery,
      ShopQueryVariables
    >({
      ...Shop,
    }, { headers });
  } catch (error: unknown) {
    handleAuthError(error, "load shop information");
  }

  return data?.shop ?? undefined;
};

export const cache = "stale-while-revalidate";

export const cacheKey = (_props: unknown, req: Request): string | null => {
  // Avoid cross-tenant cache bleed when a partner token is present
  if (getPartnerCookie(req.headers)) {
    return null;
  }

  // Shop information is generally static, so we can use the URL as the cache key
  return req.url;
};

export default shopInfos;
