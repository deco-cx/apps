import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Order ID
   */
  idPedido: number;
}

/**
 * @title Launch Accounts from Order
 * @description Creates receivable/payable accounts from an existing order
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idPedido } = props;

    const response = await ctx.api["POST /pedidos/:idPedido/lancar-contas"]({
      idPedido,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to launch accounts from order: ${JSON.stringify(errorData)}`,
      );
    }

    return;
  } catch (error) {
    console.error(
      `Error launching accounts for order ID ${props.idPedido}:`,
      error,
    );
    throw error;
  }
};

export default action;
