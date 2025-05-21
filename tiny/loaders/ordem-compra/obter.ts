import { AppContext } from "../../mod.ts";
import { OrdemCompraResponseModel } from "../../types.ts";

export interface Props {
  /**
   * @title ID da Ordem de Compra
   * @description ID da ordem de compra a ser consultada
   */
  idOrdemCompra: number;
}

/**
 * @title Obter Ordem de Compra
 * @description Obtém os detalhes de uma ordem de compra específica
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<OrdemCompraResponseModel> => {
  try {
    const { idOrdemCompra } = props;

    const response = await ctx.api["GET /ordem-compra/:idOrdemCompra"]({
      idOrdemCompra,
    });

    return await response.json();
  } catch (error) {
    console.error("Erro ao obter ordem de compra:", error);
    throw error;
  }
};

export default loader;
