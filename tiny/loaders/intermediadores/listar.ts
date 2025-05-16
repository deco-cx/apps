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

interface IntermediadorListItem {
  id: number;
  nome: string;
  tipoPessoa: string;
  cpfCnpj?: string;
  dataCriacao: string;
}

interface IntermediadorListResponse {
  itens: IntermediadorListItem[];
  paginacao: {
    pagina: number;
    total: number;
    totalPaginas: number;
  };
}

/**
 * @title List Intermediaries
 * @description Lists intermediaries with filtering and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<IntermediadorListResponse> => {
  try {
    const response = await ctx.api["GET /intermediadores"](props);

    return await response.json();
  } catch (error) {
    console.error("Error listing intermediaries:", error);
    throw error;
  }
};

export default loader;
