import { AppContext } from "../../mod.ts";
import {
  BillByID,
  createAccountsReceivableClient,
} from "../../clients/accountsReceivable.ts";

export interface Props {
  /**
   * @title ID do Título
   * @description Código único do título no contas a receber
   */
  id: number;
}

/**
 * @title Buscar Título do Contas a Receber
 * @description Retorna informações detalhadas de um título específico do contas a receber
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BillByID> => {
  const accountsReceivableClient = createAccountsReceivableClient(ctx);

  const response = await accountsReceivableClient
    ["GET /accounts-receivable/receivable-bills/:receivableBillId"]({
      receivableBillId: props.id,
    });

  const data = await response.json();
  return data;
};

export default loader;
