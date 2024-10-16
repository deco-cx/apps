import { getCartCookie } from "../utils/cart.ts";
import ensureCheckout from "../utils/ensureCheckout.ts";
import type { AppContext } from "../mod.ts";
import { GetCheckoutCoupon } from "../utils/graphql/queries.ts";
import type {
  GetCheckoutCouponQuery,
  GetCheckoutCouponQueryVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";

// https://wakecommerce.readme.io/docs/storefront-api-checkout
export default async function (
  _props: object,
  req: Request,
  ctx: AppContext,
): Promise<string | null> {
  const headers = parseHeaders(req.headers);
  const checkoutId = ensureCheckout(getCartCookie(req.headers));

  if (!checkoutId) return null;

  const { checkout } = await ctx.storefront.query<
    GetCheckoutCouponQuery,
    GetCheckoutCouponQueryVariables
  >(
    {
      variables: { checkoutId },
      ...GetCheckoutCoupon,
    },
    { headers },
  );

  return checkout?.coupon || null;
}
