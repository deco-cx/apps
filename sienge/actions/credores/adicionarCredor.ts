import { AppContext } from "../../mod.ts";
import {
  createCreditorsClient,
  CreditorInsert,
} from "../../clients/creditors.ts";

export interface Props {
  /**
   * @title Nome do Credor
   * @description Nome completo do credor
   */
  nome: string;

  /**
   * @title Tipo de Pessoa
   * @description F para pessoa física ou J para pessoa jurídica
   */
  tipoPessoa: "F" | "J";

  /**
   * @title Tipos de Credor
   * @description Lista de tipos: CO para Corretor, FO para fornecedor e FU para colaborador
   */
  tipos: ("CO" | "FO" | "FU")[];

  /**
   * @title CPF/CNPJ
   * @description CPF ou CNPJ do credor (sem máscara)
   */
  documento: string;

  /**
   * @title Inscrição Estadual
   * @description Número da inscrição estadual (opcional)
   */
  inscricaoEstadual?: string;

  /**
   * @title Tipo de Inscrição Estadual
   * @description C para Contribuinte, I para Isento ou N para Não Contribuinte
   */
  tipoInscricaoEstadual?: "C" | "I" | "N";

  /**
   * @title Inscrição Municipal
   * @description Número da inscrição municipal (opcional, apenas para PJ)
   */
  inscricaoMunicipal?: string;

  /**
   * @title Código da Forma de Pagamento
   * @description ID da forma de pagamento
   */
  formaPagamentoId?: number;

  /**
   * @title Telefone
   * @description Dados do telefone principal
   */
  telefone?: {
    ddd: string;
    numero: string;
    tipo: string;
  };

  /**
   * @title Representantes
   * @description Lista de códigos de representantes
   */
  representantes?: {
    codigo: number;
  }[];

  /**
   * @title Contatos
   * @description Lista de contatos
   */
  contatos?: {
    nome: string;
    ddd?: string;
    telefone?: string;
    email?: string;
  }[];

  /**
   * @title Procuradores
   * @description Lista de procuradores
   */
  procuradores?: {
    nome: string;
    cpf?: string;
    rg?: string;
    dataNascimento?: string;
    orgaoEmissor?: string;
  }[];

  /**
   * @title Anos de Desoneração
   * @description Lista de anos optantes pela desoneração na folha de pagamento
   */
  anosDesoneracao?: {
    ano: number;
  }[];

  /**
   * @title Endereço
   * @description Dados do endereço
   */
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    codigoCidade: number;
  };

  /**
   * @title Extrato de Conta
   * @description Configuração de extrato de conta
   */
  extratoConta?: {
    imprimirExtratoConta?: boolean;
    enviarPorEmail?: boolean;
    email?: string;
  };
}

/**
 * @title Adicionar Credor
 * @description Cadastra um novo credor no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  const creditorsClient = createCreditorsClient(ctx);

  // Converter os tipos do credor para o formato da API
  const typesId = props.tipos.map((tipo) => tipo);

  // Converter os representantes para o formato da API
  const agents = props.representantes?.map((rep) => ({
    code: rep.codigo,
  })) || [];

  // Converter os contatos para o formato da API
  const contacts = props.contatos?.map((contato) => ({
    name: contato.nome,
    ddd: contato.ddd,
    phoneNumber: contato.telefone,
    email: contato.email,
  })) || [];

  // Converter os procuradores para o formato da API
  const procurators = props.procuradores?.map((proc) => ({
    name: proc.nome,
    cpf: proc.cpf,
    rgNumber: proc.rg,
    birthDate: proc.dataNascimento,
    emittingOrgan: proc.orgaoEmissor,
  })) || [];

  // Converter os anos de desoneração para o formato da API
  const payslipDesonerationYears = props.anosDesoneracao?.map((ano) => ({
    year: ano.ano,
  })) || [];

  // Criar objeto para inserção do credor
  const creditorData: CreditorInsert = {
    name: props.nome,
    personType: props.tipoPessoa,
    typesId: typesId,
    registerNumber: props.documento,
    stateRegistrationNumber: props.inscricaoEstadual,
    stateRegistrationType: props.tipoInscricaoEstadual,
    municipalSubscription: props.inscricaoMunicipal,
    paymentTypeId: props.formaPagamentoId,
    phone: props.telefone
      ? {
        ddd: props.telefone.ddd,
        number: props.telefone.numero,
        type: props.telefone.tipo,
      }
      : undefined,
    agents: agents.length > 0 ? agents : undefined,
    contacts: contacts.length > 0 ? contacts : undefined,
    procurators: procurators.length > 0 ? procurators : undefined,
    payslipDesonerationYears: payslipDesonerationYears.length > 0
      ? payslipDesonerationYears
      : undefined,
    address: {
      zipCode: props.endereco.cep,
      street: props.endereco.logradouro,
      number: props.endereco.numero,
      complement: props.endereco.complemento,
      district: props.endereco.bairro,
      cityCode: props.endereco.codigoCidade,
    },
    accountStatement: props.extratoConta
      ? {
        printAccountStatement: props.extratoConta.imprimirExtratoConta,
        sentByEmail: props.extratoConta.enviarPorEmail,
        email: props.extratoConta.email,
      }
      : undefined,
  };

  try {
    await creditorsClient["POST /creditors"]({}, { body: creditorData });
  } catch (error) {
    console.error("Erro ao adicionar credor:", error);
    throw new Error(
      `Erro ao adicionar credor: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export default action;
