import { AppContext } from "../../mod.ts";
import {
  BudgetCategory,
  createAccountsReceivableClient,
} from "../../clients/accountsReceivable.ts";

export interface Props {
  /**
   * @title ID do Título
   * @description Código único do título no contas a receber
   */
  receivableBillId: number;

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
 * @title Buscar Apropriações Financeiras do Título
 * @description Retorna as apropriações financeiras de um título específico do contas a receber
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ apropriações: BudgetCategory[]; total: number }> => {
  const accountsReceivableClient = createAccountsReceivableClient(ctx);

  const response = await accountsReceivableClient
    ["GET /accounts-receivable/:receivableBillId/budget-categories"]({
      receivableBillId: props.receivableBillId,
      limit: props.limit,
      offset: props.offset,
    });

  const responseData = await response.json();

  return {
    apropriações: responseData.results,
    total: responseData.resultSetMetadata.count,
  };
};

export default loader;
