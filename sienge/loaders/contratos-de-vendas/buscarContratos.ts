import { AppContext } from "../../mod.ts";
import {
  createSalesContractsClient,
  SalesContract,
} from "../../clients/salesContracts.ts";

export interface Props {
  /**
   * @title ID do Cliente
   * @description Código do cliente do contrato
   */
  customerId?: number;

  /**
   * @title ID da Empresa
   * @description Código da empresa
   */
  companyId?: number;

  /**
   * @title ID do Empreendimento
   * @description ID do empreendimento
   */
  enterpriseId?: number;

  /**
   * @title Nome do Empreendimento
   * @description Nome do empreendimento
   */
  enterpriseName?: string;

  /**
   * @title ID Externo
   * @description Identificador externo
   */
  externalId?: string;

  /**
   * @title ID da Unidade
   * @description Código da unidade
   */
  unitId?: number;

  /**
   * @title Número do Contrato
   * @description Número do contrato
   */
  number?: string;

  /**
   * @title Situação
   * @description Situação do contrato (0-Solicitado, 1-Autorizado, 2-Emitido, 3-Cancelado)
   */
  situation?: string[];

  /**
   * @title Criados Após
   * @description Data inicial para filtrar contratos pela data de criação (yyyy-MM-dd)
   */
  createdAfter?: string;

  /**
   * @title Criados Antes
   * @description Data final para filtrar contratos pela data de criação (yyyy-MM-dd)
   */
  createdBefore?: string;

  /**
   * @title Modificados Após
   * @description Data inicial para filtrar contratos pela data de atualização (yyyy-MM-dd)
   */
  modifiedAfter?: string;

  /**
   * @title Modificados Antes
   * @description Data final para filtrar contratos pela data de atualização (yyyy-MM-dd)
   */
  modifiedBefore?: string;

  /**
   * @title Somente Contratos Sem Comissão
   * @description Considerar somente contratos sem comissão de venda
   */
  onlyContractsWithoutCommission?: boolean;

  /**
   * @title Data de Emissão Inicial
   * @description Filtro para consultar contratos a partir da data de emissão (yyyy-MM-dd)
   */
  initialIssueDate?: string;

  /**
   * @title Data de Emissão Final
   * @description Filtro para consultar contratos até a data de emissão (yyyy-MM-dd)
   */
  finalIssueDate?: string;

  /**
   * @title Data de Cancelamento Inicial
   * @description Filtro para consultar contratos distratados a partir da data (yyyy-MM-dd)
   */
  initialCancelDate?: string;

  /**
   * @title Data de Cancelamento Final
   * @description Filtro para consultar contratos distratados até a data (yyyy-MM-dd)
   */
  finalCancelDate?: string;

  /**
   * @title Limite
   * @description Quantidade máxima de resultados a serem retornados (máx: 200)
   * @default 100
   */
  limit?: number;

  /**
   * @title Deslocamento
   * @description Índice inicial para paginação dos resultados
   * @default 0
   */
  offset?: number;
}

/**
 * @title Buscar Contratos de Vendas
 * @description Retorna uma lista de contratos de vendas do Sienge com base nos filtros especificados
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ contratos: SalesContract[]; total: number }> => {
  const salesContractsClient = createSalesContractsClient(ctx);

  const response = await salesContractsClient["GET /sales-contracts"]({
    limit: props.limit,
    offset: props.offset,
    customerId: props.customerId,
    companyId: props.companyId,
    enterpriseId: props.enterpriseId,
    enterpriseName: props.enterpriseName,
    externalId: props.externalId,
    unitId: props.unitId,
    number: props.number,
    situation: props.situation,
    createdAfter: props.createdAfter,
    createdBefore: props.createdBefore,
    modifiedAfter: props.modifiedAfter,
    modifiedBefore: props.modifiedBefore,
    onlyContractsWithoutCommission: props.onlyContractsWithoutCommission,
    initialIssueDate: props.initialIssueDate,
    finalIssueDate: props.finalIssueDate,
    initialCancelDate: props.initialCancelDate,
    finalCancelDate: props.finalCancelDate,
  });

  const data = await response.json();

  return {
    contratos: data.contracts,
    total: data.total,
  };
};

export default loader;
