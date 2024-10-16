import type { AppContext } from "../mod.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import type {
  CustomerCreateMutation,
  CustomerCreateMutationVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { CustomerCreate } from "../utils/graphql/queries.ts";

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
      variables: { input: { ...props, customerType: "PERSON" } },
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
   * Data de nascimento DD/MM/AAAA
   */
  birthDate: Date | string;
  /**
   * CEP com pontuação 00000-000
   */
  cep: string;
  /**
   * Cidade
   */
  city: string;
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
   * Gênero
   */
  gender: "MALE" | "FEMALE";
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
}
