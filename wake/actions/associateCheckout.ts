import type { AppContext } from "../mod.ts";
import authenticate from "../utils/authenticate.ts";
import { getCartCookie } from "../utils/cart.ts";
import ensureCustomerToken from "../utils/ensureCustomerToken.ts";
import { CheckoutCustomerAssociate } from "../utils/graphql/queries.ts";
import type {
  CheckoutCustomerAssociateMutation,
  CheckoutCustomerAssociateMutationVariables,
  CustomerAuthenticatedLoginMutation,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";

// https://wakecommerce.readme.io/docs/storefront-api-checkoutcustomerassociate
export default async function (
  props: object,
  req: Request,
  ctx: AppContext,
): Promise<CustomerAuthenticatedLoginMutation["customerAuthenticatedLogin"]> {
  const headers = parseHeaders(req.headers);
  const checkoutId = getCartCookie(req.headers);
  const customerAccessToken = ensureCustomerToken(await authenticate(req, ctx));

  if (!customerAccessToken || !checkoutId) return null;

  // associate account to checkout
  await ctx.storefront.query<
    CheckoutCustomerAssociateMutation,
    CheckoutCustomerAssociateMutationVariables
  >(
    {
      variables: {
        customerAccessToken,
        checkoutId: getCartCookie(req.headers),
      },
      ...CheckoutCustomerAssociate,
    },
    { headers },
  );
}
