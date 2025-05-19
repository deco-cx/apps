import { AppContext } from "../../../mod.ts";
import {
  CriarVariacaoProdutoRequestModel,
  VariacaoProdutoModel,
} from "../../../types.ts";

export interface Props extends CriarVariacaoProdutoRequestModel {
  /**
   * @title ID do Produto
   * @description ID do produto para adicionar a variação
   */
  idProduto: number;
}

/**
 * @title Criar Variação de Produto
 * @description Cria uma nova variação para um produto específico
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<VariacaoProdutoModel> => {
  try {
    const { idProduto, ...requestBody } = props;

    const response = await ctx.api["POST /produtos/:idProduto/variacoes"]({
      idProduto,
    }, {
      body: requestBody,
    });

    return await response.json();
  } catch (error) {
    console.error("Erro ao criar variação de produto:", error);
    throw error;
  }
};

export default action;
