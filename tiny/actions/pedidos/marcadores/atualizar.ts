import { AppContext } from "../../../mod.ts";
import { AtualizarMarcadoresRequestModel } from "../../../types.ts";

export interface Props {
  /**
   * @title ID do Pedido
   * @description Identificador único do pedido
   */
  idPedido: number;

  /**
   * @title Marcadores
   * @description Lista de marcadores a serem atualizados
   */
  marcadores: {
    id: number;
    nome?: string;
    cor?: string;
  }[];
}

/**
 * @title Atualizar Marcadores do Pedido
 * @description Atualiza os marcadores associados a um pedido específico
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idPedido, marcadores } = props;

    const requestBody: AtualizarMarcadoresRequestModel = {
      marcadores,
    };

    const response = await ctx.api["PUT /pedidos/:idPedido/marcadores"](
      {
        idPedido,
      },
      {
        body: requestBody,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Erro ao atualizar marcadores: ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error(
      `Erro ao atualizar marcadores do pedido ID ${props.idPedido}:`,
      error,
    );
    throw error;
  }
};

export default action;
