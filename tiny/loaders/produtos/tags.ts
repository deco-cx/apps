import { AppContext } from "../../mod.ts";
import { TagsProdutoResponseModel } from "../../types.ts";

export interface Props {
  /**
   * @title ID do Produto
   * @description ID do produto para consultar tags
   */
  idProduto: number;
}

/**
 * @title Obter Tags de Produto
 * @description Obtém as tags de um produto específico
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TagsProdutoResponseModel> => {
  try {
    const { idProduto } = props;

    const response = await ctx.api["GET /produtos/:idProduto/tags"]({
      idProduto,
    });

    return await response.json();
  } catch (error) {
    console.error("Erro ao obter tags do produto:", error);
    throw error;
  }
};

export default loader;
