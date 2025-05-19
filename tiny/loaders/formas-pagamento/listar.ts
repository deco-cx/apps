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

interface FormaPagamentoListItem {
  id: number;
  nome: string;
  numeroParcelas: number;
  ativo: boolean;
}

interface FormasPagamentoListResponse {
  itens: FormaPagamentoListItem[];
  paginacao: {
    pagina: number;
    total: number;
    totalPaginas: number;
  };
}

/**
 * @title List Payment Methods
 * @description Lists payment methods with filters and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FormasPagamentoListResponse> => {
  try {
    const response = await ctx.api["GET /formas-pagamento"](props);

    return await response.json();
  } catch (error) {
    console.error("Error loading payment methods:", error);
    throw error;
  }
};

export default loader;
