import { AppContext } from "../../../mod.ts";

export interface Props {
  /**
   * @title ID do Produto
   * @description ID do produto da variação
   */
  idProduto: number;

  /**
   * @title ID da Variação
   * @description ID da variação a ser excluída
   */
  idVariacao: number;
}

/**
 * @title Excluir Variação de Produto
 * @description Remove uma variação de produto específica
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idProduto, idVariacao } = props;

    await ctx.api["DELETE /produtos/:idProduto/variacoes/:idVariacao"]({
      idProduto,
      idVariacao,
    });
  } catch (error) {
    console.error("Erro ao excluir variação de produto:", error);
    throw error;
  }
};

export default action;
