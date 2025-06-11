import type { AppContext } from "../mod.ts";

interface Props {
  /**
   * @title ID do Pedido
   * @description ID do pedido na SuperFrete
   */
  orderId: string;
}

interface PrintLabelResponse {
  url: string;
}

/**
 * @title Link para Impressao da Etiqueta
 * @description Obtém o link para impressão da etiqueta de um pedido na SuperFrete
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PrintLabelResponse> => {
  const { orderId } = props;

  const response = await ctx.api["POST /api/v0/orders/:order_id/print"]({
    order_id: orderId,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao obter link de impressão: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result;
};

export default action; 