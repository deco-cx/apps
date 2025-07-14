import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Filter by name
   */
  nome?: string;

  /**
   * @description Filter by active status
   */
  ativo?: boolean;

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

interface ListaPrecoListItem {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface ListasPrecosListResponse {
  itens: ListaPrecoListItem[];
  paginacao: {
    pagina: number;
    total: number;
    totalPaginas: number;
  };
}

/**
 * @title List Price Lists
 * @description Lists price lists with filtering and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListasPrecosListResponse> => {
  try {
    const response = await ctx.api["GET /listas-precos"](props);

    return await response.json();
  } catch (error) {
    console.error("Error listing price lists:", error);
    throw error;
  }
};

export default loader;
