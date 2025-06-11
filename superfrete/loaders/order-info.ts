import type { AppContext } from "../mod.ts";
import type { OrderInfo } from "../client.ts";

interface Props {
  /**
   * @title Order ID
   * @description ID do pedido na SuperFrete
   */
  orderId: string;
}

/**
 * @name Get Order Information
 * @title Get Order Information
 * @description Obtém informações detalhadas de um pedido específico na SuperFrete
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<OrderInfo> => {
  const { orderId } = props;

  const response = await ctx.api["GET /api/v0/orders/:order_id"]({
    order_id: orderId,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erro ao buscar informações do pedido: ${response.status} - ${errorText}`,
    );
  }

  const result = await response.json();
  return result;
};

export default loader;
