import { setCookie } from "std/http/cookie.ts";
import type { AppContext } from "../mod.ts";
import { CustomerSocialLoginGoogle } from "../utils/graphql/queries.ts";
import type {
  CustomerSocialLoginGoogleMutation,
  CustomerSocialLoginGoogleMutationVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import { setUserCookie } from "../utils/user.ts";

// https://wakecommerce.readme.io/docs/storefront-api-customersociallogingoogle
export default async function (
  { userCredential }: Props,
  req: Request,
  { storefront, response }: AppContext,
): Promise<
  {
    customerSocialLoginGoogle:
      CustomerSocialLoginGoogleMutation["customerSocialLoginGoogle"];
    hasAccount: boolean;
  } | null
> {
  const headers = parseHeaders(req.headers);

  const { customerSocialLoginGoogle } = await storefront.query<
    CustomerSocialLoginGoogleMutation,
    CustomerSocialLoginGoogleMutationVariables
  >(
    {
      variables: { userCredential },
      ...CustomerSocialLoginGoogle,
    },
    { headers },
  );

  const token = customerSocialLoginGoogle?.token;

  if (!token) throw new Error("No google token found");

  if (customerSocialLoginGoogle?.type === "NEW") {
    setCookie(response.headers, {
      name: "partialCustomerToken",
      value: token,
      // 1 hour
      expires: new Date(Date.now() + 60 * 60 * 1000),
      path: "/",
    });
  } else if (customerSocialLoginGoogle?.type === "AUTHENTICATED") {
    setUserCookie(
      response.headers,
      customerSocialLoginGoogle.token as string,
      customerSocialLoginGoogle.legacyToken as string,
      new Date(customerSocialLoginGoogle.validUntil),
    );
  } else {
    throw new Error(`Not implemented type: ${customerSocialLoginGoogle?.type}`);
  }

  return {
    customerSocialLoginGoogle,
    hasAccount: customerSocialLoginGoogle?.type === "AUTHENTICATED",
  };
}

interface Props {
  /**
   * Credencial retornada pelo processo de login da api do Google
   */
  userCredential: string;
}
