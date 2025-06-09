import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description ID of the account receivable
   */
  idContaReceber: number;

  /**
   * @description Payment date (YYYY-MM-DD)
   */
  dataPagamento: string;

  /**
   * @description Paid value
   */
  valorPago: number;

  /**
   * @description Discount value
   */
  valorDesconto?: number;

  /**
   * @description Addition value
   */
  valorAcrescimo?: number;

  /**
   * @description Observations
   */
  observacao?: string;
}

/**
 * @title Mark Account Receivable as Paid
 * @description Marks an account receivable as paid
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  try {
    const { idContaReceber, ...requestBody } = props;

    const response = await ctx.api
      ["POST /contas-receber/:idContaReceber/baixar"]({
        idContaReceber,
      }, {
        body: requestBody,
      });

    return await response.json();
  } catch (error) {
    console.error("Error marking account receivable as paid:", error);
    throw error;
  }
};

export default action;
