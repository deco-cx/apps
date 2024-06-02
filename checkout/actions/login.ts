import type { AppContext } from "../mod.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import type {
  CustomerAuthenticatedLoginMutation,
  CustomerAuthenticatedLoginMutationVariables,
} from "../graphql/storefront.graphql.gen.ts";
import { CustomerAuthenticatedLogin } from "../../checkout/graphql/queries.ts";
import { setCookie } from "std/http/cookie.ts";

export default async function (
  props: Props,
  req: Request,
  { storefront, response }: AppContext,
): Promise<CustomerAuthenticatedLoginMutation["customerAuthenticatedLogin"]> {
  const headers = parseHeaders(req.headers);

  const { customerAuthenticatedLogin } = await storefront.query<
    CustomerAuthenticatedLoginMutation,
    CustomerAuthenticatedLoginMutationVariables
  >({ variables: props, ...CustomerAuthenticatedLogin }, { headers });

  if (customerAuthenticatedLogin) {
    setCookie(response.headers, {
      name: "customerAccessToken",
      path: "/",
      value: customerAuthenticatedLogin.token as string,
      expires: new Date(customerAuthenticatedLogin.validUntil),
    });
    setCookie(response.headers, {
      name: "customerAccessTokenExpires",
      path: "/",
      value: customerAuthenticatedLogin.validUntil,
      expires: new Date(customerAuthenticatedLogin.validUntil),
    });
  }

  return customerAuthenticatedLogin;
}

export interface Props {
  /**
   * Email
   */
  input: string;
  /**
   * Senha
   */
  pass: string;
}
