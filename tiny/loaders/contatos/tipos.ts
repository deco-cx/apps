import { AppContext } from "../../mod.ts";
import { ListarTiposDeContatosModelResponse } from "../../types.ts";

export interface Props {
  nome?: string;
  limit?: number;
  offset?: number;
}

/**
 * @title List Contact Types
 * @description Lists contact types with filters and pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  itens: ListarTiposDeContatosModelResponse[];
  paginacao: {
    pagina: number;
    total: number;
    totalPaginas: number;
  };
}> => {
  try {
    const response = await ctx.api["GET /contatos/tipos"](props);

    return await response.json();
  } catch (error) {
    console.error("Error listing contact types:", error);
    throw error;
  }
};

export default loader;
