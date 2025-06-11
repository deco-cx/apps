import type { AppContext } from "../mod.ts";

interface Props {
  /**
   * @title Order ID
   * @description Order ID in SuperFrete
   */
  orderId: string;
}

interface CancelOrderResponse {
  message: string;
}

/**
 * @name Cancel Order
 * @title Cancel Order
 * @description Cancels an order in SuperFrete
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CancelOrderResponse> => {
  const { orderId } = props;

  const response = await ctx.api["POST /api/v0/orders/:order_id/cancel"]({
    order_id: orderId,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erro ao cancelar pedido: ${response.status} - ${errorText}`,
    );
  }

  const result = await response.json();
  return result;
};

export default action;
