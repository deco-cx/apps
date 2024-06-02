import type { AppContext } from "../mod.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import type {
  GetUserQuery,
  GetUserQueryVariables,
} from "../graphql/storefront.graphql.gen.ts";
import { GetUser } from "../graphql/queries.ts";
import getCustomerAcessToken from "../utils/getCustomerAcessToken.ts";

// https://wakecommerce.readme.io/docs/storefront-api-customer
export default async function (
  _props: object,
  req: Request,
  { storefront }: AppContext,
): Promise<GetUserQuery["customer"]> {
  const headers = parseHeaders(req.headers);

  const { customer } = await storefront.query<
    GetUserQuery,
    GetUserQueryVariables
  >(
    {
      variables: { customerAccessToken: getCustomerAcessToken(req) },
      ...GetUser,
    },
    { headers },
  );

  return customer;
}
