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
    "birthDate",
    "cpf",
    "email",
    "fullName",
    "primaryPhoneAreaCode",
    "primaryPhoneNumber",
  ];

  const props = Object.fromEntries(
    Object.entries(_props).filter(([key]) => keys.includes(key)),
  );

  const input = {
    ...props,
    customerType: "PERSON",
  } as CustomerSimpleCreateInputGraphInput;
  const customerAccessToken = cookies.partialCustomerToken ??
    cookies.customerToken;

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
   * Data de nascimento DD/MM/AAAA
   */
  birthDate: Date | string;
  /**
   * CPF com pontuação 000.000.000-00
   */
  cpf: string;
  /**
   * Email
   */
  email: string;
  /**
   * Nome completo
   */
  fullName: string;
  /**
   * DDD do telefone principal do cliente
   */
  primaryPhoneAreaCode: string;
  /**
   * Telefone principal do cliente com pontuação xxxxx-xxxx
   */
  primaryPhoneNumber: string;
}
