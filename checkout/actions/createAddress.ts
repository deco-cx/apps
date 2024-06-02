import type { AppContext } from "../mod.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import type {
  CustomerAddressCreateMutation,
  CustomerAddressCreateMutationVariables,
} from "../graphql/storefront.graphql.gen.ts";
import { CustomerAddressCreate } from "../../checkout/graphql/queries.ts";
import getCustomerAcessToken from "../utils/getCustomerAcessToken.ts";

// https://wakecommerce.readme.io/docs/customeraddresscreate
export default async function (
  props: Props,
  req: Request,
  { storefront }: AppContext,
): Promise<CustomerAddressCreateMutation["customerAddressCreate"]> {
  const headers = parseHeaders(req.headers);

  const { customerAddressCreate } = await storefront.query<
    CustomerAddressCreateMutation,
    CustomerAddressCreateMutationVariables
  >(
    {
      variables: {
        address: props,
        customerAccessToken: getCustomerAcessToken(req),
      },
      ...CustomerAddressCreate,
    },
    { headers },
  );

  return customerAddressCreate;
}

interface Props {
  /**
   * Detalhes do endereço
   */
  addressDetails: string;
  /**
   * Número do endereço
   */
  addressNumber: string;
  /**
   * Cep do endereço
   */
  cep: string;
  /**
   * Cidade do endereço
   */
  city: string;
  /**
   * País do endereço, ex. BR
   */
  country: string;
  /**
   * E-mail do usuário
   */
  email: string;
  /**
   * Nome do usuário
   */
  name: string;
  /**
   * Bairro do endereço
   */
  neighborhood: string;
  /**
   * Telefone do usuário
   */
  phone: string;
  /**
   * Ponto de referência do endereço
   */
  referencePoint?: string;
  /**
   * Estado do endereço
   */
  state: string;
  /**
   * Rua do endereço
   */
  street: string;
}
