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

interface FormaEnvioListItem {
  id: number;
  nome: string;
  servico?: string;
  ativo: boolean;
}

interface FormasEnvioListResponse {
  itens: FormaEnvioListItem[];
  paginacao: {
    pagina: number;
    total: number;
    totalPaginas: number;
  };
}

/**
 * @title List Shipping Methods
 * @description Lists shipping methods with filtering and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FormasEnvioListResponse> => {
  try {
    const response = await ctx.api["GET /formas-envio"](props);

    return await response.json();
  } catch (error) {
    console.error("Error listing shipping methods:", error);
    throw error;
  }
};

export default loader;
