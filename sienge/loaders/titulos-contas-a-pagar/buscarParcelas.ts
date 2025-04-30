import { AppContext } from "../../mod.ts";
import {
  BillInstallment,
  createBillDebtClient,
} from "../../clients/billDebt.ts";

export interface Props {
  /**
   * @title ID do Título
   * @description Código único do título no contas a pagar
   */
  billId: number;

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
 * @title Buscar Parcelas do Título
 * @description Retorna as parcelas de um título específico do contas a pagar
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ parcelas: BillInstallment[]; total: number }> => {
  const billDebtClient = createBillDebtClient(ctx);

  const response = await billDebtClient["GET /bills/:billId/installments"]({
    billId: props.billId,
    limit: props.limit,
    offset: props.offset,
  });

  const responseData = await response.json();

  return {
    parcelas: responseData.results,
    total: responseData.resultSetMetadata.count,
  };
};

export default loader;
