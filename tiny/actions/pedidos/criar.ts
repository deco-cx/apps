import { AppContext } from "../../mod.ts";

export interface PedidoItem {
  /**
   * @description Product ID
   */
  idProduto: number;

  /**
   * @description Product quantity
   */
  quantidade: number;

  /**
   * @description Unit price
   */
  valor?: number;

  /**
   * @description Discount percentage
   */
  desconto?: number;
}

export interface Props {
  /**
   * @description Contact/customer ID
   */
  idContato: number;

  /**
   * @description Order date (YYYY-MM-DD)
   */
  data?: string;

  /**
   * @description Payment method ID
   */
  idFormaPagamento?: number;

  /**
   * @description Shipping method ID
   */
  idFormaEnvio?: number;

  /**
   * @description Seller ID
   */
  idVendedor?: number;

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

  /**
   * @description Order items
   */
  itens: PedidoItem[];
}

interface CriarPedidoResponse {
  /**
   * @description Created order ID
   */
  idPedido: number;

  /**
   * @description Order number
   */
  numero: string;
}

/**
 * @title Create New Order
 * @description Creates a new sales order
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CriarPedidoResponse> => {
  try {
    const response = await ctx.api["POST /pedidos"](
      {},
      {
        body: props,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create order: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export default action;
