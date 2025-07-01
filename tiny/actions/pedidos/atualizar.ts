import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Order ID
   */
  idPedido: number;

  /**
   * @description Order number
   */
  numero?: string;

  /**
   * @description Order date
   */
  data?: string;

  /**
   * @description Order status ID
   */
  idSituacao?: number;

  /**
   * @description Order transport method ID
   */
  idFormaPagamento?: number;

  /**
   * @description Order shipping method ID
   */
  idFormaEnvio?: number;

  /**
   * @description External order number
   */
  numeroPedidoExterno?: string;

  /**
   * @description Observations
   */
  observacoes?: string;

  /**
   * @description Internal observations
   */
  observacoesInternas?: string;
}

/**
 * @title Update Order
 * @description Updates an existing order with new information
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idPedido, ...updateData } = props;

    const response = await ctx.api["PUT /pedidos/:idPedido"]({
      idPedido,
    }, {
      body: updateData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update order: ${JSON.stringify(errorData)}`);
    }

    return;
  } catch (error) {
    console.error(`Error updating order ID ${props.idPedido}:`, error);
    throw error;
  }
};

export default action;
