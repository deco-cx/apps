import { AppContext } from "../../mod.ts";
import { ListagemContasPagarResponseModel } from "../../types.ts";

export interface Props {
  /**
   * @description Filter by client name
   */
  nomeCliente?: string;

  /**
   * @description Filter by account status
   */
  situacao?: "aberto" | "cancelada" | "pago" | "parcial" | "prevista";

  /**
   * @description Filter by issue start date (YYYY-MM-DD)
   */
  dataInicialEmissao?: string;

  /**
   * @description Filter by issue end date (YYYY-MM-DD)
   */
  dataFinalEmissao?: string;

  /**
   * @description Filter by due date start (YYYY-MM-DD)
   */
  dataInicialVencimento?: string;

  /**
   * @description Filter by due date end (YYYY-MM-DD)
   */
  dataFinalVencimento?: string;

  /**
   * @description Filter by document number
   */
  numeroDocumento?: string;

  /**
   * @description Filter by bank number
   */
  numeroBanco?: string;

  /**
   * @description Filter by tags
   */
  marcadores?: string[];

  /**
   * @description Filter by contact ID
   */
  idContato?: number;

  /**
   * @description Sort order
   */
  orderBy?: "asc" | "desc";

  /**
   * @description Pagination limit
   * @default 100
   */
  limit?: number;

  /**
   * @description Pagination offset
   * @default 0
   */
  offset?: number;
}

/**
 * @title List Accounts Payable
 * @description Lists accounts payable with filtering and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListagemContasPagarResponseModel> => {
  try {
    const response = await ctx.api["GET /contas-pagar"](props);

    return await response.json();
  } catch (error) {
    console.error("Error listing accounts payable:", error);
    throw error;
  }
};

export default loader;
