import { AppContext } from "../../mod.ts";
import {
  ContractAttachment,
  ContractGuarantor,
  ContractInstallment,
  createSalesContractsClient,
  SalesContractInsert,
} from "../../clients/salesContracts.ts";

export interface Props {
  /**
   * @title Número do Contrato
   * @description Número de identificação do contrato
   */
  number?: string;

  /**
   * @title Data de Emissão
   * @description Data de emissão do contrato (formato yyyy-MM-dd)
   */
  issueDate?: string;

  /**
   * @title ID da Unidade
   * @description Código da unidade imobiliária
   */
  unitId: number;

  /**
   * @title ID do Cliente
   * @description Código do cliente comprador
   */
  customerId: number;

  /**
   * @title ID da Empresa
   * @description Código da empresa
   */
  companyId: number;

  /**
   * @title ID do Empreendimento
   * @description ID do empreendimento
   */
  enterpriseId: number;

  /**
   * @title ID Externo
   * @description Identificador externo do contrato
   */
  externalId?: string;

  /**
   * @title Data da Venda
   * @description Data da venda (formato yyyy-MM-dd)
   */
  saleDate?: string;

  /**
   * @title ID do Tipo de Financiamento
   * @description Código do tipo de financiamento
   */
  financingTypeId?: number;

  /**
   * @title Nome do Remetente
   * @description Nome do remetente do contrato
   */
  senderName?: string;

  /**
   * @title ID do Indexador
   * @description Código do indexador
   */
  indexerId?: number;

  /**
   * @title Período de Carência
   * @description Período de carência do contrato
   */
  gracePeriod?: number;

  /**
   * @title Índice do Período de Carência
   * @description Índice do período de carência
   */
  gracePeriodIndex?: number;

  /**
   * @title Unidade do Período de Carência
   * @description Unidade do período de carência
   */
  gracePeriodUnit?: number;

  /**
   * @title Cobrar Juros no Período de Carência
   * @description Indica se deve cobrar juros no período de carência
   */
  chargeInterestOnGracePeriod?: boolean;

  /**
   * @title ID do Vendedor
   * @description Código do vendedor
   */
  salePersonId?: number;

  /**
   * @title ID da Imobiliária
   * @description Código da imobiliária
   */
  brokerId?: number;

  /**
   * @title Incluir IPTU no Valor
   * @description Indica se deve incluir o IPTU no valor do contrato
   */
  includePropertyTaxInValue?: boolean;

  /**
   * @title Tabela de Preços
   * @description Tabela de preços utilizada
   */
  pricingTable?: string;

  /**
   * @title Desconto na Tabela de Preços
   * @description Desconto aplicado na tabela de preços
   */
  pricingTableDiscount?: number;

  /**
   * @title Ajuste
   * @description Valor de ajuste do contrato
   */
  adjustment?: number;

  /**
   * @title Valor do Ajuste Contratual
   * @description Valor do ajuste contratual
   */
  contractualAdjustmentValue?: number;

  /**
   * @title Valor da Venda
   * @description Valor da venda do contrato
   */
  saleValue?: number;

  /**
   * @title Comissão
   * @description Valor da comissão
   */
  commission?: number;

  /**
   * @title Nome do Cliente 2
   * @description Nome do segundo cliente no contrato
   */
  customerName2?: string;

  /**
   * @title CPF do Cliente 2
   * @description CPF do segundo cliente
   */
  customerCpf2?: string;

  /**
   * @title Percentual de Participação do Cliente 2
   * @description Percentual de participação do segundo cliente
   */
  customerParticipationPercent2?: number;

  /**
   * @title Anexos
   * @description Lista de anexos do contrato
   */
  attachments?: ContractAttachment[];

  /**
   * @title Avalistas
   * @description Lista de avalistas do contrato
   */
  guarantors?: ContractGuarantor[];

  /**
   * @title Parcelas
   * @description Lista de parcelas do contrato
   */
  installments?: ContractInstallment[];
}

/**
 * @title Adicionar Contrato de Venda
 * @description Cadastra um novo contrato de venda no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const salesContractsClient = createSalesContractsClient(ctx);

  try {
    const salesContract: SalesContractInsert = {
      number: props.number,
      issueDate: props.issueDate,
      unitId: props.unitId,
      customerId: props.customerId,
      companyId: props.companyId,
      enterpriseId: props.enterpriseId,
      externalId: props.externalId,
      saleDate: props.saleDate,
      financingTypeId: props.financingTypeId,
      senderName: props.senderName,
      indexerId: props.indexerId,
      gracePeriod: props.gracePeriod,
      gracePeriodIndex: props.gracePeriodIndex,
      gracePeriodUnit: props.gracePeriodUnit,
      chargeInterestOnGracePeriod: props.chargeInterestOnGracePeriod,
      salePersonId: props.salePersonId,
      brokerId: props.brokerId,
      includePropertyTaxInValue: props.includePropertyTaxInValue,
      pricingTable: props.pricingTable,
      pricingTableDiscount: props.pricingTableDiscount,
      adjustment: props.adjustment,
      contractualAdjustmentValue: props.contractualAdjustmentValue,
      saleValue: props.saleValue,
      commission: props.commission,
      customerName2: props.customerName2,
      customerCpf2: props.customerCpf2,
      customerParticipationPercent2: props.customerParticipationPercent2,
      attachments: props.attachments,
      guarantors: props.guarantors,
      installments: props.installments,
    };

    await salesContractsClient["POST /sales-contracts"]({}, {
      body: salesContract,
    });

    return {
      success: true,
      message: "Contrato de venda cadastrado com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao adicionar contrato de venda:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao cadastrar contrato de venda: ${errorMessage}`,
    };
  }
};

export default action;
