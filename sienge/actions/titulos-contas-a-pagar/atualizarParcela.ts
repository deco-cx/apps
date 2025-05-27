import { AppContext } from "../../mod.ts";
import {
  BillInstallmentUpdate,
  createBillDebtClient,
} from "../../clients/billDebt.ts";

export interface Props {
  /**
   * @title ID do Título
   * @description Código único do título no contas a pagar
   */
  billId: number;

  /**
   * @title ID da Parcela
   * @description Número da parcela do título
   */
  installmentId: number;

  /**
   * @title Data de Vencimento
   * @description Nova data de vencimento da parcela (formato yyyy-MM-dd)
   */
  dueDate?: string;

  /**
   * @title Desconto
   * @description Valor de desconto da parcela
   */
  discount?: number;

  /**
   * @title Acréscimo
   * @description Valor de acréscimo da parcela
   */
  addition?: number;

  /**
   * @title Observação
   * @description Observação da parcela
   */
  note?: string;
}

/**
 * @title Atualizar Parcela do Título
 * @description Atualiza as informações de uma parcela específica de um título
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<boolean> => {
  const billDebtClient = createBillDebtClient(ctx);

  try {
    const installmentData: BillInstallmentUpdate = {
      dueDate: props.dueDate,
      discount: props.discount,
      addition: props.addition,
      note: props.note,
    };

    await billDebtClient["PATCH /bills/:billId/installments/:installmentId"](
      {
        billId: props.billId,
        installmentId: props.installmentId,
      },
      {
        body: installmentData,
      },
    );

    return true;
  } catch (error) {
    console.error("Erro ao atualizar parcela:", error);
    return false;
  }
};

export default action;
