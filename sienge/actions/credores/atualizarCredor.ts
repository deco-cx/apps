import { AppContext } from "../../mod.ts";
import {
  createCreditorsClient,
  CreditorUpdate,
} from "../../clients/creditors.ts";

export interface Props {
  /**
   * @title ID do Credor
   * @description ID único do credor no Sienge
   */
  creditorId: number;

  /**
   * @title Nome do Credor
   * @description Nome completo do credor
   */
  nome?: string;

  /**
   * @title Tipo de Pessoa
   * @description F para pessoa física ou J para pessoa jurídica
   */
  tipoPessoa?: "F" | "J";

  /**
   * @title CPF
   * @description CPF do credor (sem máscara, apenas para pessoa física)
   */
  cpf?: string;

  /**
   * @title CNPJ
   * @description CNPJ do credor (sem máscara, apenas para pessoa jurídica)
   */
  cnpj?: string;

  /**
   * @title Inscrição Estadual
   * @description Número da inscrição estadual (apenas para pessoa jurídica)
   */
  inscricaoEstadual?: string;

  /**
   * @title Tipo de Inscrição Estadual
   * @description C para Contribuinte, I para Isento ou N para Não Contribuinte (apenas para pessoa jurídica)
   */
  tipoInscricaoEstadual?: "C" | "I" | "N";

  /**
   * @title Inscrição Municipal
   * @description Número da inscrição municipal (apenas para pessoa jurídica)
   */
  inscricaoMunicipal?: string;

  /**
   * @title Endereço
   * @description Dados do endereço
   */
  endereco?: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    codigoCidade: number;
  };
}

/**
 * @title Atualizar Credor
 * @description Atualiza os dados de um credor existente no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  const creditorsClient = createCreditorsClient(ctx);

  // Criar objeto para atualização do credor
  const creditorData: CreditorUpdate = {
    name: props.nome,
    personType: props.tipoPessoa,
    cpf: props.cpf,
    cnpj: props.cnpj,
    stateRegistrationNumber: props.inscricaoEstadual,
    stateRegistrationType: props.tipoInscricaoEstadual,
    municipalSubscription: props.inscricaoMunicipal,
    address: props.endereco
      ? {
        zipCode: props.endereco.cep,
        street: props.endereco.logradouro,
        number: props.endereco.numero,
        complement: props.endereco.complemento,
        district: props.endereco.bairro,
        cityCode: props.endereco.codigoCidade,
      }
      : undefined,
  };

  try {
    await creditorsClient["PATCH /creditors/:creditorId"]({
      creditorId: props.creditorId,
    }, { body: creditorData });
  } catch (error) {
    console.error("Erro ao atualizar credor:", error);
    throw new Error(
      `Erro ao atualizar credor: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export default action;
