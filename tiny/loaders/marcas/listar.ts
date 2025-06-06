import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Filter by name
   */
  nome?: string;

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

interface MarcaListItem {
  id: number;
  nome: string;
  descricao?: string;
  dataCriacao: string;
}

interface MarcasListResponse {
  itens: MarcaListItem[];
  paginacao: {
    pagina: number;
    total: number;
    totalPaginas: number;
  };
}

/**
 * @title List Brands
 * @description Lists brands with filtering and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MarcasListResponse> => {
  try {
    const response = await ctx.api["GET /marcas"](props);

    return await response.json();
  } catch (error) {
    console.error("Error listing brands:", error);
    throw error;
  }
};

export default loader;
