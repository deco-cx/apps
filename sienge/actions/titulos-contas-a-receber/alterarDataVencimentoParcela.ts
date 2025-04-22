import { AppContext } from "../../mod.ts";
import { createAccountsReceivableClient } from "../../clients/accountsReceivable.ts";

export interface Props {
  /**
   * @title ID do Título
   * @description Código único do título no contas a receber
   */
  receivableBillId: number;

  /**
   * @title ID da Parcela
   * @description Número da parcela do título
   */
  installmentId: number;

  /**
   * @title Nova Data de Vencimento
   * @description Nova data de vencimento para a parcela (formato yyyy-MM-dd)
   */
  newDueDate: string;
}

/**
 * @title Alterar Data de Vencimento da Parcela
 * @description Altera a data de vencimento de uma parcela específica do título
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<boolean> => {
  const accountsReceivableClient = createAccountsReceivableClient(ctx);

  try {
    await accountsReceivableClient
      ["PATCH /accounts-receivable/receivable-bills/:receivableBillId/installments/:installmentId/change-due-date"](
        {
          receivableBillId: props.receivableBillId,
          installmentId: props.installmentId,
        },
        {
          body: {
            newDueDate: props.newDueDate,
          },
        },
      );

    return true;
  } catch (error) {
    console.error("Erro ao alterar data de vencimento:", error);
    return false;
  }
};

export default action;
