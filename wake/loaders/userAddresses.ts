import type { AppContext } from "../mod.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import type {
  GetUserAddressesQuery,
  GetUserAddressesQueryVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { GetUserAddresses } from "../utils/graphql/queries.ts";
import authenticate from "apps/wake/utils/authenticate.ts";
import ensureCustomerToken from "apps/wake/utils/ensureCustomerToken.ts";

// https://wakecommerce.readme.io/docs/storefront-api-customer
export default async function (
  _props: object,
  req: Request,
  ctx: AppContext,
): Promise<NonNullable<GetUserAddressesQuery["customer"]>["addresses"]> {
  const headers = parseHeaders(req.headers);
  const customerAccessToken = ensureCustomerToken(await authenticate(req, ctx));

  if (!customerAccessToken) return null;

  const { customer } = await ctx.storefront.query<
    GetUserAddressesQuery,
    GetUserAddressesQueryVariables
  >(
    {
      variables: { customerAccessToken },
      ...GetUserAddresses,
    },
    { headers },
  );

  return customer?.addresses || [];
}
