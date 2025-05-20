import { AppContext } from "../mod.ts";
import { ListagemCategoriasReceitaDespesaResponse } from "../types.ts";

export interface Props {
  /**
   * @title Description
   * @description Filter by category description
   */
  descricao?: string;

  /**
   * @title Group
   * @description Filter by category group
   */
  grupo?: string;

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
 * @title List Income/Expense Categories
 * @description Lists income and expense categories with filters and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListagemCategoriasReceitaDespesaResponse> => {
  try {
    const { descricao, grupo, orderBy, limit = 100, offset = 0 } = props;

    const response = await ctx.api["GET /categorias-receita-despesa"]({
      descricao,
      grupo,
      orderBy,
      limit,
      offset,
    });

    return await response.json();
  } catch (error) {
    console.error("Error fetching income/expense categories:", error);
    throw error;
  }
};

export default loader;
