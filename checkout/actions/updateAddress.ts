import type { AppContext } from "../mod.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import type {
  CustomerAddressUpdateMutation,
  CustomerAddressUpdateMutationVariables,
} from "../graphql/storefront.graphql.gen.ts";
import { CustomerAddressUpdate } from "../graphql/queries.ts";
import getCustomerAcessToken from "../utils/getCustomerAcessToken.ts";

// https://wakecommerce.readme.io/docs/customeraddressupdate
export default async function (
  props: Props,
  req: Request,
  { storefront }: AppContext,
): Promise<CustomerAddressUpdateMutation["customerAddressUpdate"]> {
  const headers = parseHeaders(req.headers);

  const { customerAddressUpdate } = await storefront.query<
    CustomerAddressUpdateMutation,
    CustomerAddressUpdateMutationVariables
  >(
    {
      variables: {
        address: props.address,
        id: props.addressId,
        customerAccessToken: getCustomerAcessToken(req),
      },
      ...CustomerAddressUpdate,
    },
    { headers },
  );

  return customerAddressUpdate;
}

interface Props {
  /**
   * ID do endereço
   */
  addressId: string;
  address: {
    /**
     * Detalhes do endereço
     */
    addressDetails?: string;
    /**
     * Número do endereço
     */
    addressNumber?: string;
    /**
     * Cep do endereço
     */
    cep?: string;
    /**
     * Cidade do endereço
     */
    city?: string;
    /**
     * País do endereço, ex. BR
     */
    country?: string;
    /**
     * E-mail do usuário
     */
    email?: string;
    /**
     * Nome do usuário
     */
    name?: string;
    /**
     * Bairro do endereço
     */
    neighborhood?: string;
    /**
     * Telefone do usuário
     */
    phone?: string;
    /**
     * Ponto de referência do endereço
     */
    referencePoint?: string;
    /**
     * Estado do endereço
     */
    state?: string;
    /**
     * Rua do endereço
     */
    street?: string;
  };
}
