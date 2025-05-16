import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Filter by note type
   */
  tipo?: "E - Entrada" | "S - Saida";

  /**
   * @description Filter by note number
   */
  numero?: number;

  /**
   * @description Filter by CPF or CNPJ
   */
  cpfCnpj?: string;

  /**
   * @description Filter by start date
   */
  dataInicial?: string;

  /**
   * @description Filter by end date
   */
  dataFinal?: string;

  /**
   * @description Filter by note status
   */
  situacao?:
    | "1 - Pendente"
    | "2 - Emitida"
    | "3 - Cancelada"
    | "4 - Enviada Aguardando Recibo"
    | "5 - Rejeitada"
    | "6 - Autorizada"
    | "7 - Emitida Danfe"
    | "8 - Registrada"
    | "9 - Enviada Aguardando Protocolo"
    | "10 - Denegada";

  /**
   * @description Filter by e-commerce order number
   */
  numeroPedidoEcommerce?: string;

  /**
   * @description Filter by seller ID
   */
  idVendedor?: number;

  /**
   * @description Filter by shipping method ID
   */
  idFormaEnvio?: number;

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

interface BaseNotaFiscalModel {
  situacao?: string;
  tipo?: string;
  numero?: string;
  serie?: string;
  chaveAcesso?: string;
  dataEmissao?: string;
  cliente: {
    id: number;
    nome?: string;
    fantasia?: string;
    tipoPessoa?: string;
    cpfCnpj?: string;
    ie?: string;
    rg?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cep?: string;
    cidade?: string;
    uf?: string;
    email?: string;
    fone?: string;
  };
}

interface ListagemNotaFiscalModel extends BaseNotaFiscalModel {
  id: number;
  ecommerce?: {
    numeroPedido?: string;
    codigoPedido?: string;
    nomePlataforma?: string;
  };
}

interface PaginatedResultModel {
  pagina: number;
  total: number;
  totalPaginas: number;
}

interface ListarNotasFiscaisResponse {
  itens: ListagemNotaFiscalModel[];
  paginacao: PaginatedResultModel;
}

/**
 * @title List Tax Notes
 * @description Lists tax notes with filters and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListarNotasFiscaisResponse> => {
  try {
    const response = await ctx.api["GET /notas"](props);

    return await response.json();
  } catch (error) {
    console.error("Error loading tax notes:", error);
    throw error;
  }
};

export default loader;
