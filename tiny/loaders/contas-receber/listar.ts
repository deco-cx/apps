import { AppContext } from "../../mod.ts";
import { ListagemContasReceberResponse } from "../../types.ts";

export interface Props {
  /**
   * @title Customer Name
   * @description Filter by customer name
   */
  nomeCliente?: string;

  /**
   * @title Status
   * @description Filter by status
   */
  situacao?: "aberto" | "cancelada" | "pago" | "parcial" | "prevista";

  /**
   * @title Initial Issue Date
   * @description Filter by initial issue date (format: YYYY-MM-DD)
   */
  dataInicialEmissao?: string;

  /**
   * @title Final Issue Date
   * @description Filter by final issue date (format: YYYY-MM-DD)
   */
  dataFinalEmissao?: string;

  /**
   * @title Initial Due Date
   * @description Filter by initial due date (format: YYYY-MM-DD)
   */
  dataInicialVencimento?: string;

  /**
   * @title Final Due Date
   * @description Filter by final due date (format: YYYY-MM-DD)
   */
  dataFinalVencimento?: string;

  /**
   * @title Document Number
   * @description Filter by document number
   */
  numeroDocumento?: string;

  /**
   * @title Bank Number
   * @description Filter by bank number
   */
  numeroBanco?: string;

  /**
   * @title Invoice ID
   * @description Filter by invoice ID
   */
  idNota?: number;

  /**
   * @title Sale ID
   * @description Filter by sale ID
   */
  idVenda?: number;

  /**
   * @title Markers
   * @description Filter by markers
   */
  marcadores?: string[];

  /**
   * @title Order By
   * @description Sorting order
   */
  orderBy?: "asc" | "desc";

  /**
   * @title Limit
   * @description Number of results per page
   * @default 100
   */
  limit?: number;

  /**
   * @title Offset
   * @description Pagination offset
   * @default 0
   */
  offset?: number;
}

/**
 * @title List Receivable Accounts
 * @description Lists receivable accounts with filtering and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListagemContasReceberResponse> => {
  try {
    const {
      nomeCliente,
      situacao,
      dataInicialEmissao,
      dataFinalEmissao,
      dataInicialVencimento,
      dataFinalVencimento,
      numeroDocumento,
      numeroBanco,
      idNota,
      idVenda,
      marcadores,
      orderBy,
      limit = 100,
      offset = 0,
    } = props;

    const response = await ctx.api["GET /contas-receber"]({
      nomeCliente,
      situacao,
      dataInicialEmissao,
      dataFinalEmissao,
      dataInicialVencimento,
      dataFinalVencimento,
      numeroDocumento,
      numeroBanco,
      idNota,
      idVenda,
      marcadores,
      orderBy,
      limit,
      offset,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to list receivable accounts: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error listing receivable accounts:", error);
    throw error;
  }
};

export default loader;
