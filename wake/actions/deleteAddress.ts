import type { AppContext } from "../mod.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import type {
  CustomerAddressRemoveMutation,
  CustomerAddressRemoveMutationVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { CustomerAddressRemove } from "../utils/graphql/queries.ts";
import authenticate from "../utils/authenticate.ts";
import ensureCustomerToken from "../utils/ensureCustomerToken.ts";

// https://wakecommerce.readme.io/docs/customeraddressremove
export default async function (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CustomerAddressRemoveMutation["customerAddressRemove"]> {
  const headers = parseHeaders(req.headers);
  const customerAccessToken = ensureCustomerToken(await authenticate(req, ctx));

  const { customerAddressRemove } = await ctx.storefront.query<
    CustomerAddressRemoveMutation,
    CustomerAddressRemoveMutationVariables
  >(
    {
      variables: {
        id: props.addressId,
        customerAccessToken,
      },
      ...CustomerAddressRemove,
    },
    { headers },
  );

  return customerAddressRemove;
}

interface Props {
  /**
   * ID do endereço
   */
  addressId: string;
}
