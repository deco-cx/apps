import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Filter by service name
   */
  nome?: string;

  /**
   * @description Filter by active status
   */
  ativo?: boolean;

  /**
   * @description Sort order
   * @default "asc"
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

interface ServicoItem {
  id: number;
  nome: string;
  descricao?: string;
  valor: number;
  observacoes?: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao?: string;
}

interface PaginatedResultModel {
  pagina: number;
  total: number;
  totalPaginas: number;
}

interface ListarServicosResponse {
  itens: ServicoItem[];
  paginacao: PaginatedResultModel;
}

/**
 * @title List Services
 * @description Lists services with filters and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListarServicosResponse> => {
  try {
    const response = await ctx.api["GET /servicos"](props);

    return await response.json();
  } catch (error) {
    console.error("Error listing services:", error);
    throw error;
  }
};

export default loader;
