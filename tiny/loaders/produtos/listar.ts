import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Filter by product name
   */
  nome?: string;

  /**
   * @description Filter by product code
   */
  codigo?: string;

  /**
   * @description Filter by category ID
   */
  idCategoria?: number;

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

interface ProdutoListItem {
  id: number;
  codigo?: string;
  nome: string;
  preco: number;
  precoCusto?: number;
  unidade?: string;
  idCategoria?: number;
  ativo: boolean;
}

interface ProdutosListResponse {
  itens: ProdutoListItem[];
  paginacao: {
    pagina: number;
    total: number;
    totalPaginas: number;
  };
}

/**
 * @title List Products
 * @description Lists products with filters and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ProdutosListResponse> => {
  try {
    const response = await ctx.api["GET /produtos"](props);

    return await response.json();
  } catch (error) {
    console.error("Error listing products:", error);
    throw error;
  }
};

export default loader;
