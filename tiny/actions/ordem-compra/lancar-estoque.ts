import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title ID da Ordem de Compra
   * @description ID da ordem de compra para lançar estoque
   */
  idOrdemCompra: number;
}

/**
 * @title Lançar Estoque da Ordem de Compra
 * @description Lança o estoque de uma ordem de compra
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idOrdemCompra } = props;

    await ctx.api["POST /ordem-compra/:idOrdemCompra/lancar-estoque"]({
      idOrdemCompra,
    });
  } catch (error) {
    console.error("Erro ao lançar estoque da ordem de compra:", error);
    throw error;
  }
};

export default action;
