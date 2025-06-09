import { AppContext } from "../../mod.ts";
import { AtualizarDespachoRequestModel } from "../../types.ts";

export interface Props extends AtualizarDespachoRequestModel {
  /**
   * @title ID do Pedido
   * @description ID do pedido para atualizar informações de despacho
   */
  idPedido: number;
}

/**
 * @title Atualizar Despacho do Pedido
 * @description Atualiza informações de despacho (rastreamento) de um pedido
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idPedido, ...requestBody } = props;

    await ctx.api["PUT /pedidos/:idPedido/despacho"]({
      idPedido,
    }, {
      body: requestBody,
    });
  } catch (error) {
    console.error("Erro ao atualizar despacho do pedido:", error);
    throw error;
  }
};

export default action;
