import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title ID do Pedido
   * @description ID do pedido para estornar estoque
   */
  idPedido: number;
}

/**
 * @title Estornar Estoque do Pedido
 * @description Estorna o estoque associado a um pedido
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idPedido } = props;

    await ctx.api["POST /pedidos/:idPedido/estornar-estoque"]({
      idPedido,
    });
  } catch (error) {
    console.error("Erro ao estornar estoque do pedido:", error);
    throw error;
  }
};

export default action;
