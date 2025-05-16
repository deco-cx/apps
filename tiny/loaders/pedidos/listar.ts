import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Filter by order status
   */
  situacao?: string;

  /**
   * @description Filter by start date
   */
  dataInicial?: string;

  /**
   * @description Filter by end date
   */
  dataFinal?: string;

  /**
   * @description Filter by seller ID
   */
  idVendedor?: number;

  /**
   * @description Filter by contact ID
   */
  idContato?: number;

  /**
   * @description Filter by CPF/CNPJ
   */
  cpfCnpj?: string;

  /**
   * @description Filter by order number
   */
  numero?: string;

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

interface PedidoListItem {
  id: number;
  numero: string;
  situacao: string;
  data: string;
  valor: number;
  idContato?: number;
  nomeContato?: string;
  cpfCnpj?: string;
  tipoContato: string;
  idVendedor?: number;
  nomeVendedor?: string;
  observacao?: string;
}

interface PedidosListResponse {
  itens: PedidoListItem[];
  paginacao: {
    pagina: number;
    total: number;
    totalPaginas: number;
  };
}

/**
 * @title List Orders
 * @description Lists orders with filters and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PedidosListResponse> => {
  try {
    const response = await ctx.api["GET /pedidos"](props);

    return await response.json();
  } catch (error) {
    console.error("Error listing orders:", error);
    throw error;
  }
};

export default loader;
