import { AppContext } from "../mod.ts";
import authenticate from "../utils/authenticate.ts";
import { GetWishlist } from "../utils/graphql/queries.ts";
import {
  GetWishlistQuery,
  GetWishlistQueryVariables,
  WishlistReducedProductFragment,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import { handleAuthError } from "../utils/authError.ts";

/**
 * @title Wake Integration
 * @description Product Wishlist loader
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<WishlistReducedProductFragment[]> => {
  const { storefront } = ctx;

  const headers = parseHeaders(req.headers);

  const customerAccessToken = await authenticate(req, ctx);

  if (!customerAccessToken) return [];

  let data: GetWishlistQuery | undefined;
  try {
    data = await storefront.query<
      GetWishlistQuery,
      GetWishlistQueryVariables
    >({
      variables: { customerAccessToken },
      ...GetWishlist,
    }, {
      headers,
    });
  } catch (error: unknown) {
    handleAuthError(error, "load wishlist");
  }

  return data?.customer?.wishlist?.products?.filter((
    p,
  ): p is WishlistReducedProductFragment => Boolean(p)) ?? [];
};

export default loader;

// User-specific wishlist data; must not be cached/shared.
export const cache = "no-store";
