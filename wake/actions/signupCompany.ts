import { CustomerCreate } from "../utils/graphql/queries.ts";
import type {
  CustomerCreateMutation,
  CustomerCreateMutationVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import type { AppContext } from "../mod.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";

// https://wakecommerce.readme.io/docs/storefront-api-customercreate
export default async function (
  props: Props,
  req: Request,
  { storefront }: AppContext,
): Promise<CustomerCreateMutation["customerCreate"] | null> {
  const headers = parseHeaders(req.headers);

  const { customerCreate } = await storefront.query<
    CustomerCreateMutation,
    CustomerCreateMutationVariables
  >(
    {
      variables: { input: { ...props, customerType: "COMPANY" } },
      ...CustomerCreate,
    },
    { headers },
  );

  return customerCreate ?? null;
}

interface Props {
  /**
   * Endereço
   */
  address: string;
  /**
   * Complemento
   */
  addressComplement: string;
  /**
   * Número do endereço
   */
  addressNumber: string;
  /**
   * CEP com pontuação 00000-000
   */
  cep: string;
  /**
   * Cidade
   */
  city: string;
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
   * Bairro
   */
  neighborhood: string;
  /**
   * Aceitar assinar newsletter?
   */
  newsletter?: boolean;
  /**
   * Senha de cadastro
   */
  password: string;
  /**
   * Confirmação da senha de cadastro
   */
  passwordConfirmation: string;
  /**
   * DDD do telefone principal do cliente
   */
  primaryPhoneAreaCode: string;
  /**
   * Telefone principal do cliente com pontuação xxxxx-xxxx
   */
  primaryPhoneNumber: string;
  /**
   * Nome do destinatário
   */
  receiverName: string;
  /**
   * Referência de endereço
   */
  reference?: string;
  /**
   * É revendedor?
   */
  reseller?: boolean;
  /**
   * DDD do telefone secundário do cliente
   */
  secondaryPhoneAreaCode?: string;
  /**
   * Telefone secundário do cliente com pontuação xxxxx-xxxx
   */
  secondaryPhoneNumber?: string;
  /**
   * Estado do endereço
   */
  state: string;
  /**
   * Inscrição estadual da empresa
   */
  stateRegistration?: string;
}
