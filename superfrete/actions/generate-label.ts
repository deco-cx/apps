import type { AppContext } from "../mod.ts";
import type { Order } from "../client.ts";

interface Props {
  /**
   * @title Order ID
   * @description ID do pedido na SuperFrete
   */
  orderId: string;
}

/**
 * @name Generate Label
 * @title Generate Label
 * @description Finaliza o pedido e gera a etiqueta de envio na SuperFrete
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Order> => {
  const { orderId } = props;

  const response = await ctx.api["POST /api/v0/orders/:order_id/generate"]({
    order_id: orderId,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erro ao gerar etiqueta: ${response.status} - ${errorText}`,
    );
  }

  const result = await response.json();
  return result;
};

export default action;
