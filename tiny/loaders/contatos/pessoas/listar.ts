import { AppContext } from "../../../mod.ts";
import { ListagemContatosContatoModelResponse } from "../../../types.ts";

export interface Props {
  idContato: number;
  limit?: number;
  offset?: number;
}

/**
 * @title List Contact People
 * @description Lists people associated with a specific contact with pagination
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  itens: ListagemContatosContatoModelResponse[];
  paginacao: {
    pagina: number;
    total: number;
    totalPaginas: number;
  };
}> => {
  try {
    const { idContato, ...searchParams } = props;

    const response = await ctx.api["GET /contatos/:idContato/pessoas"]({
      idContato,
      ...searchParams,
    });

    return await response.json();
  } catch (error) {
    console.error("Error listing contact people:", error);
    throw error;
  }
};

export default loader;
