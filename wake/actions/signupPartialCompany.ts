import { deleteCookie, getCookies } from "std/http/cookie.ts";
import type { AppContext } from "../mod.ts";
import { CustomerCompletePartialRegistration } from "../utils/graphql/queries.ts";
import type {
  CompleteRegistrationMutation,
  CompleteRegistrationMutationVariables,
  CustomerSimpleCreateInputGraphInput,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import { setUserCookie } from "../utils/user.ts";

// https://wakecommerce.readme.io/docs/storefront-api-customercompletepartialregistration
export default async function (
  _props: Props,
  req: Request,
  { storefront, response }: AppContext,
): Promise<
  CompleteRegistrationMutation["customerCompletePartialRegistration"] | null
> {
  const headers = parseHeaders(req.headers);
  const cookies = getCookies(req.headers);

  const keys = [
    "cnpj",
    "corporateName",
    "email",
    "isStateRegistrationExempt",
    "primaryPhoneAreaCode",
    "primaryPhoneNumber",
    "stateRegistration",
  ];

  const props = Object.fromEntries(
    Object.entries(_props).filter(([key]) => keys.includes(key)),
  );

  const input = {
    ...props,
    customerType: "COMPANY",
  } as CustomerSimpleCreateInputGraphInput;
  const customerAccessToken = cookies.partialCustomerToken;

  const { customerCompletePartialRegistration } = await storefront.query<
    CompleteRegistrationMutation,
    CompleteRegistrationMutationVariables
  >(
    {
      variables: { input, customerAccessToken },
      ...CustomerCompletePartialRegistration,
    },
    { headers },
  );

  if (customerCompletePartialRegistration) {
    setUserCookie(
      response.headers,
      customerCompletePartialRegistration.token as string,
      customerCompletePartialRegistration.legacyToken as string,
      new Date(customerCompletePartialRegistration.validUntil),
    );

    deleteCookie(response.headers, "partialCustomerToken", { path: "/" });
  }

  return customerCompletePartialRegistration ?? null;
}

interface Props {
  /**
   * CNPJ com pontuação 00.000.000/0000-00
   */
  cnpj: string;
  /**
   * Nome da empresa
   */
  corporateName: string;
  /**
   * Email
   */
  email: string;
  /**
   * Isento de inscrição estadual
   */
  isStateRegistrationExempt?: boolean;
  /**
   * DDD do telefone principal do cliente
   */
  primaryPhoneAreaCode: string;
  /**
   * Telefone principal do cliente com pontuação xxxxx-xxxx
   */
  primaryPhoneNumber: string;
  /**
   * Inscrição estadual da empresa
   */
  stateRegistration?: string;
}
