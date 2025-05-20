import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Order ID
   */
  idPedido: number;

  /**
   * @description New status ID
   */
  idSituacao: number;
}

/**
 * @title Update Order Status
 * @description Updates the status of an existing order
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idPedido, idSituacao } = props;

    const response = await ctx.api["PUT /pedidos/:idPedido/situacao"]({
      idPedido,
    }, {
      body: { idSituacao },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to update order status: ${JSON.stringify(errorData)}`,
      );
    }

    return;
  } catch (error) {
    console.error(
      `Error updating status for order ID ${props.idPedido}:`,
      error,
    );
    throw error;
  }
};

export default action;
