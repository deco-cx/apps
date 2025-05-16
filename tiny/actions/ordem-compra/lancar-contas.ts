import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title ID da Ordem de Compra
   * @description ID da ordem de compra para lançar contas
   */
  idOrdemCompra: number;
}

/**
 * @title Lançar Contas da Ordem de Compra
 * @description Lança as contas a pagar de uma ordem de compra
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idOrdemCompra } = props;

    await ctx.api["POST /ordem-compra/:idOrdemCompra/lancar-contas"]({
      idOrdemCompra,
    });
  } catch (error) {
    console.error("Erro ao lançar contas da ordem de compra:", error);
    throw error;
  }
};

export default action;
