import type { AppContext } from "../mod.ts";
import authenticate from "../utils/authenticate.ts";
import { getCartCookie } from "../utils/cart.ts";
import ensureCheckout from "../utils/ensureCheckout.ts";
import ensureCustomerToken from "../utils/ensureCustomerToken.ts";
import { CheckoutCustomerAssociate } from "../utils/graphql/queries.ts";
import type {
  CheckoutCustomerAssociateMutation,
  CheckoutCustomerAssociateMutationVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";

// https://wakecommerce.readme.io/docs/storefront-api-checkoutcustomerassociate
export default async function (_props: object, req: Request, ctx: AppContext) {
  try {
    const headers = parseHeaders(req.headers);
    const checkoutId = ensureCheckout(getCartCookie(req.headers));
    const customerAccessToken = ensureCustomerToken(
      await authenticate(req, ctx),
    );

    // associate account to checkout
    await ctx.storefront.query<
      CheckoutCustomerAssociateMutation,
      CheckoutCustomerAssociateMutationVariables
    >(
      {
        variables: {
          customerAccessToken,
          checkoutId,
        },
        ...CheckoutCustomerAssociate,
      },
      { headers },
    );
  } catch (err) {
    console.error("Associate Checkout Error", err);
    throw err;
  }
}
