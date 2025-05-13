import { AppContext } from "../../mod.ts";
import {
  createCustomersClient,
  CustomerInsert,
} from "../../clients/customers.ts";

export interface Props {
  /**
   * @title Código do Cliente
   * @description Código único de identificação do cliente
   */
  code: string;

  /**
   * @title Nome do Cliente
   * @description Nome completo do cliente
   */
  description: string;

  /**
   * @title Descrição Complementar
   * @description Informações adicionais sobre o cliente
   */
  complementaryDescription?: string;

  /**
   * @title Ativo
   * @description Indica se o cliente está ativo
   */
  active?: boolean;

  /**
   * @title Sem Comunicação
   * @description Indica se o cliente não deve receber comunicações
   */
  noCommunication?: boolean;

  /**
   * @title Data de Nascimento
   * @description Data de nascimento do cliente (formato yyyy-MM-dd)
   */
  birthDate?: string;

  /**
   * @title Telefone
   * @description Número de telefone do cliente
   */
  phoneNumber?: string;

  /**
   * @title Celular
   * @description Número de celular do cliente
   */
  cellPhoneNumber?: string;

  /**
   * @title Email
   * @description Endereço de email do cliente
   */
  email?: string;

  /**
   * @title Endereço
   * @description Endereço residencial do cliente
   */
  homeAddress?: string;

  /**
   * @title Número
   * @description Número do endereço residencial
   */
  homeNumber?: string;

  /**
   * @title Complemento
   * @description Complemento do endereço residencial
   */
  homeComplement?: string;

  /**
   * @title Bairro
   * @description Bairro do endereço residencial
   */
  homeNeighborhood?: string;

  /**
   * @title ID da Cidade
   * @description Código da cidade no Sienge
   */
  homeCityId?: number;

  /**
   * @title CEP
   * @description CEP do endereço residencial
   */
  homeZipCode?: string;

  /**
   * @title CPF
   * @description CPF do cliente (somente números)
   */
  cpf?: string;

  /**
   * @title CNPJ
   * @description CNPJ do cliente (somente números)
   */
  cnpj?: string;

  /**
   * @title ID Internacional
   * @description Informação de identificação internacional
   */
  internationalId?: string;

  /**
   * @title Tipo de Pessoa
   * @description 0 - Pessoa Física, 1 - Pessoa Jurídica
   */
  personType: number;

  /**
   * @title Razão Social
   * @description Razão social para pessoa jurídica
   */
  corporateName?: string;

  /**
   * @title Tipo do Cliente
   * @description ID do tipo do cliente no Sienge
   */
  customerTypeId?: number;
}

/**
 * @title Adicionar Cliente
 * @description Cadastra um novo cliente no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const customersClient = createCustomersClient(ctx);

  try {
    const customer: CustomerInsert = {
      code: props.code,
      description: props.description,
      complementaryDescription: props.complementaryDescription,
      active: props.active,
      noCommunication: props.noCommunication,
      birthDate: props.birthDate,
      phoneNumber: props.phoneNumber,
      cellPhoneNumber: props.cellPhoneNumber,
      email: props.email,
      homeAddress: props.homeAddress,
      homeNumber: props.homeNumber,
      homeComplement: props.homeComplement,
      homeNeighborhood: props.homeNeighborhood,
      homeCityId: props.homeCityId,
      homeZipCode: props.homeZipCode,
      cpf: props.cpf,
      cnpj: props.cnpj,
      internationalId: props.internationalId,
      personType: props.personType,
      corporateName: props.corporateName,
      customerTypeId: props.customerTypeId,
    };

    await customersClient["POST /customers"]({}, {
      body: customer,
    });

    return {
      success: true,
      message: "Cliente cadastrado com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao adicionar cliente:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao cadastrar cliente: ${errorMessage}`,
    };
  }
};

export default action;
