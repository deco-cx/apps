import { AppContext } from "../../mod.ts";
import { ListagemVendedoresResponseModel } from "../../types.ts";

export interface Props {
  /**
   * @title Nome
   * @description Filtrar por nome do vendedor
   */
  nome?: string;

  /**
   * @title Email
   * @description Filtrar por email do vendedor
   */
  email?: string;

  /**
   * @title Ativo
   * @description Filtrar vendedores ativos ou inativos
   */
  ativo?: boolean;

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
 * @title Listar Vendedores
 * @description Lista todos os vendedores com filtragem e paginação
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListagemVendedoresResponseModel> => {
  try {
    const {
      nome,
      email,
      ativo,
      orderBy,
      limit = 100,
      offset = 0,
    } = props;

    // Pass search parameters to the API
    const response = await ctx.api["GET /vendedores"]({
      nome,
      email,
      ativo,
      orderBy,
      limit,
      offset,
    });

    return await response.json();
  } catch (error) {
    console.error("Erro ao listar vendedores:", error);
    throw error;
  }
};

export default loader;
