import { AppContext } from "../../../mod.ts";
import { ExcluirMarcadoresRequestModel } from "../../../types.ts";

export interface Props {
  /**
   * @title ID do Pedido
   * @description Identificador único do pedido
   */
  idPedido: number;

  /**
   * @title IDs dos Marcadores
   * @description Lista de IDs dos marcadores a serem excluídos
   */
  ids: number[];
}

/**
 * @title Excluir Marcadores do Pedido
 * @description Exclui marcadores de um pedido específico
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idPedido, ids } = props;

    const requestBody: ExcluirMarcadoresRequestModel = {
      ids,
    };

    const response = await ctx.api["DELETE /pedidos/:idPedido/marcadores"](
      {
        idPedido,
      },
      {
        body: requestBody,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Erro ao excluir marcadores: ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error(
      `Erro ao excluir marcadores do pedido ID ${props.idPedido}:`,
      error,
    );
    throw error;
  }
};

export default action;
