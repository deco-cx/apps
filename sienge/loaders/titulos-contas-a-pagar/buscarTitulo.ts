import { AppContext } from "../../mod.ts";
import { Bill, createBillDebtClient } from "../../clients/billDebt.ts";

export interface Props {
  /**
   * @title ID do Título
   * @description Código único do título no contas a pagar
   */
  billId: number;
}

/**
 * @title Buscar Título do Contas a Pagar
 * @description Retorna informações detalhadas de um título específico do contas a pagar
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Bill> => {
  const billDebtClient = createBillDebtClient(ctx);

  const response = await billDebtClient["GET /bills/:billId"]({
    billId: props.billId,
  });

  const data = await response.json();
  return data;
};

export default loader;
