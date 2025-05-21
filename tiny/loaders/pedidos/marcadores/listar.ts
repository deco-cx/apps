import { AppContext } from "../../../mod.ts";
import { ObterMarcadorResponseModel } from "../../../types.ts";

export interface Props {
  /**
   * @title ID do Pedido
   * @description Identificador único do pedido
   */
  idPedido: number;
}

/**
 * @title Listar Marcadores do Pedido
 * @description Lista os marcadores associados a um pedido específico
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ObterMarcadorResponseModel[]> => {
  try {
    const { idPedido } = props;

    const response = await ctx.api["GET /pedidos/:idPedido/marcadores"]({
      idPedido,
    });

    return await response.json();
  } catch (error) {
    console.error(
      `Erro ao listar marcadores do pedido ID ${props.idPedido}:`,
      error,
    );
    throw error;
  }
};

export default loader;
