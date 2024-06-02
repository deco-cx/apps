import type { AppContext } from "../mod.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import type {
  CustomerAddressRemoveMutation,
  CustomerAddressRemoveMutationVariables,
} from "../graphql/storefront.graphql.gen.ts";
import { CustomerAddressRemove } from "../graphql/queries.ts";
import getCustomerAcessToken from "../utils/getCustomerAcessToken.ts";

// https://wakecommerce.readme.io/docs/customeraddressremove
export default async function (
  props: Props,
  req: Request,
  { storefront }: AppContext,
): Promise<CustomerAddressRemoveMutation["customerAddressRemove"]> {
  const headers = parseHeaders(req.headers);

  const { customerAddressRemove } = await storefront.query<
    CustomerAddressRemoveMutation,
    CustomerAddressRemoveMutationVariables
  >(
    {
      variables: {
        id: props.addressId,
        customerAccessToken: getCustomerAcessToken(req),
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
