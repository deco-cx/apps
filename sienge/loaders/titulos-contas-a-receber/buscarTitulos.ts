import { AppContext } from "../../mod.ts";
import {
  Bill,
  createAccountsReceivableClient,
} from "../../clients/accountsReceivable.ts";

export interface Props {
  /**
   * @title ID do Cliente
   * @description Código do cliente para buscar os títulos
   */
  customerId: number;

  /**
   * @title ID da Empresa
   * @description Código da empresa (opcional)
   */
  companyId?: number;

  /**
   * @title ID do Centro de Custo
   * @description Código do centro de custo (opcional)
   */
  costCenterId?: number;

  /**
   * @title Somente Quitados
   * @description Filtrar apenas títulos quitados
   */
  paidOff?: boolean;

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
 * @title Buscar Títulos do Contas a Receber
 * @description Retorna uma lista de títulos do contas a receber para um cliente específico
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ titulos: Bill[]; total: number }> => {
  const accountsReceivableClient = createAccountsReceivableClient(ctx);

  const response = await accountsReceivableClient
    ["GET /accounts-receivable/receivable-bills"]({
      customerId: props.customerId,
      companyId: props.companyId,
      costCenterId: props.costCenterId,
      paidOff: props.paidOff,
      limit: props.limit,
      offset: props.offset,
    });

  const responseData = await response.json();

  return {
    titulos: responseData.results,
    total: responseData.resultSetMetadata.count,
  };
};

export default loader;
