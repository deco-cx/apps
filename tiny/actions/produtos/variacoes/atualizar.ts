import { AppContext } from "../../../mod.ts";
import {
  AtualizarVariacaoProdutoRequestModel,
  VariacaoProdutoModel,
} from "../../../types.ts";

export interface Props extends AtualizarVariacaoProdutoRequestModel {
  /**
   * @title ID do Produto
   * @description ID do produto da variação
   */
  idProduto: number;

  /**
   * @title ID da Variação
   * @description ID da variação a ser atualizada
   */
  idVariacao: number;
}

/**
 * @title Atualizar Variação de Produto
 * @description Atualiza uma variação de produto específica
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<VariacaoProdutoModel> => {
  try {
    const { idProduto, idVariacao, ...requestBody } = props;

    const response = await ctx.api
      ["PUT /produtos/:idProduto/variacoes/:idVariacao"]({
        idProduto,
        idVariacao,
      }, {
        body: requestBody,
      });

    return await response.json();
  } catch (error) {
    console.error("Erro ao atualizar variação de produto:", error);
    throw error;
  }
};

export default action;
