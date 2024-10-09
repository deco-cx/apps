import type { AppContext } from "../mod.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import type {
  CheckoutAddressAssociateMutation,
  CheckoutAddressAssociateMutationVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { CheckoutAddressAssociate } from "../utils/graphql/queries.ts";
import authenticate from "../utils/authenticate.ts";
import ensureCustomerToken from "../utils/ensureCustomerToken.ts";
import { getCartCookie } from "../utils/cart.ts";
import ensureCheckout from "../utils/ensureCheckout.ts";

// https://wakecommerce.readme.io/docs/storefront-api-checkoutaddressassociate
export default async function (props: Props, req: Request, ctx: AppContext) {
  const headers = parseHeaders(req.headers);
  const customerAccessToken = ensureCustomerToken(await authenticate(req, ctx));
  const checkoutId = ensureCheckout(getCartCookie(req.headers));

  await ctx.storefront.query<
    CheckoutAddressAssociateMutation,
    CheckoutAddressAssociateMutationVariables
  >(
    {
      variables: {
        addressId: props.addressId,
        customerAccessToken,
        checkoutId,
      },
      ...CheckoutAddressAssociate,
    },
    { headers },
  );
}

interface Props {
  /**
   * ID do endereço
   */
  addressId: string;
}
