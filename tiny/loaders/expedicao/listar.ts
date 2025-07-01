import { AppContext } from "../../mod.ts";
import { ListagemAgrupamentosExpedicaoResponseModel } from "../../types.ts";

export interface Props {
  /**
   * @title Nome
   * @description Filtrar por nome do agrupamento
   */
  nome?: string;

  /**
   * @title Situação
   * @description Filtrar por situação do agrupamento
   */
  situacao?: string;

  /**
   * @title Data Inicial
   * @description Filtrar por data inicial de criação
   */
  dataInicial?: string;

  /**
   * @title Data Final
   * @description Filtrar por data final de criação
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
 * @title Listar Agrupamentos de Expedição
 * @description Lista todos os agrupamentos de expedição com filtragem e paginação
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListagemAgrupamentosExpedicaoResponseModel> => {
  try {
    const {
      nome,
      situacao,
      dataInicial,
      dataFinal,
      orderBy,
      limit = 100,
      offset = 0,
    } = props;

    // Pass search parameters as part of the same object as path parameters
    const response = await ctx.api["GET /expedicao"]({
      nome,
      situacao,
      dataInicial,
      dataFinal,
      orderBy,
      limit,
      offset,
    });

    return await response.json();
  } catch (error) {
    console.error("Erro ao listar agrupamentos de expedição:", error);
    throw error;
  }
};

export default loader;
