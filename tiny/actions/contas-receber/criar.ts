import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Account type (single or installment)
   */
  tipo: string;

  /**
   * @description ID of the payment method
   */
  idFormaPagamento: number;

  /**
   * @description Number of installments
   */
  numerosParcelas?: number;

  /**
   * @description Issue date (YYYY-MM-DD)
   */
  dataEmissao: string;

  /**
   * @description Due date (YYYY-MM-DD)
   */
  dataVencimento: string;

  /**
   * @description Value of the account
   */
  valor: number;

  /**
   * @description Discount value
   */
  valorDesconto?: number;

  /**
   * @description Addition value
   */
  valorAcrescimo?: number;

  /**
   * @description Document number
   */
  numeroDocumento?: string;

  /**
   * @description Bank number
   */
  numeroBanco?: string;

  /**
   * @description ID of the associated contact
   */
  idContato?: number;

  /**
   * @description Observations
   */
  observacao?: string;

  /**
   * @description Account status
   */
  situacao?: "aberto" | "prevista";

  /**
   * @description ID of the receipt category
   */
  idCategoria?: number;
}

/**
 * @title Create Account Receivable
 * @description Creates a new account receivable
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  try {
    const response = await ctx.api["POST /contas-receber"]({}, {
      body: props,
    });

    return await response.json();
  } catch (error) {
    console.error("Error creating account receivable:", error);
    throw error;
  }
};

export default action;
