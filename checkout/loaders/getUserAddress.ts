import type { AppContext } from "../mod.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import type {
  GetUserAddressQuery,
  GetUserAddressQueryVariables,
} from "../graphql/storefront.graphql.gen.ts";
import { GetUserAddress } from "../graphql/queries.ts";
import getCustomerAcessToken from "../utils/getCustomerAcessToken.ts";

// https://wakecommerce.readme.io/docs/storefront-api-customer
export default async function (
  _props: object,
  req: Request,
  { storefront }: AppContext,
): Promise<GetUserAddressQuery["customer"]> {
  const headers = parseHeaders(req.headers);

  const { customer } = await storefront.query<
    GetUserAddressQuery,
    GetUserAddressQueryVariables
  >(
    {
      variables: { customerAccessToken: getCustomerAcessToken(req) },
      ...GetUserAddress,
    },
    { headers },
  );

  return customer;
}
