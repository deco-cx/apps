import { AppContext } from "../../mod.ts";
import { ListagemOrdemServicoResponseModel } from "../../types.ts";

export interface Props {
  /**
   * @title Nome/Número
   * @description Filtrar por nome ou número da ordem de serviço
   */
  nome?: string;

  /**
   * @title Situação
   * @description Filtrar por situação da ordem de serviço
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
   * @title ID do Cliente
   * @description Filtrar por ID do cliente
   */
  idCliente?: number;

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
 * @title Listar Ordens de Serviço
 * @description Lista todas as ordens de serviço com filtragem e paginação
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListagemOrdemServicoResponseModel> => {
  try {
    const {
      nome,
      situacao,
      dataInicial,
      dataFinal,
      idCliente,
      orderBy,
      limit = 100,
      offset = 0,
    } = props;

    // Pass search parameters to the API
    const response = await ctx.api["GET /ordem-servico"]({
      nome,
      situacao,
      dataInicial,
      dataFinal,
      idCliente,
      orderBy,
      limit,
      offset,
    });

    return await response.json();
  } catch (error) {
    console.error("Erro ao listar ordens de serviço:", error);
    throw error;
  }
};

export default loader;
