import { AppContext } from "../../mod.ts";
import { ListagemCustoProdutoResponseModel } from "../../types.ts";

export interface Props {
  /**
   * @title ID do Produto
   * @description ID do produto para consultar custos
   */
  idProduto: number;

  /**
   * @title Data Inicial
   * @description Filtrar por data inicial de inclusão
   */
  dataInicial?: string;

  /**
   * @title Data Final
   * @description Filtrar por data final de inclusão
   */
  dataFinal?: string;

  /**
   * @title Ordenação
   * @description Ordenar resultados de forma crescente ou decrescente
   */
  orderBy?: "asc" | "desc";

  /**
   * @title Limite
   * @description Limite de registros por página
   * @default 100
   */
  limit?: number;

  /**
   * @title Offset
   * @description Deslocamento para paginação
   * @default 0
   */
  offset?: number;
}

/**
 * @title Listar Custos de Produto
 * @description Lista o histórico de custos de um produto específico
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListagemCustoProdutoResponseModel> => {
  try {
    const {
      idProduto,
      dataInicial,
      dataFinal,
      orderBy,
      limit = 100,
      offset = 0,
    } = props;

    const response = await ctx.api["GET /produtos/:idProduto/custos"]({
      idProduto,
      dataInicial,
      dataFinal,
      orderBy,
      limit,
      offset,
    });

    return await response.json();
  } catch (error) {
    console.error("Erro ao listar custos do produto:", error);
    throw error;
  }
};

export default loader;
