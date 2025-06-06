import { AppContext } from "../../../mod.ts";
import { CriarMarcadorRequestModel } from "../../../types.ts";

export interface Props {
  /**
   * @title ID do Pedido
   * @description Identificador único do pedido
   */
  idPedido: number;

  /**
   * @title Nome
   * @description Nome do marcador
   */
  nome: string;

  /**
   * @title Cor
   * @description Cor do marcador em formato hexadecimal
   */
  cor: string;
}

/**
 * @title Criar Marcador para Pedido
 * @description Cria um novo marcador para um pedido específico
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idPedido, nome, cor } = props;

    const requestBody: CriarMarcadorRequestModel = {
      nome,
      cor,
    };

    const response = await ctx.api["POST /pedidos/:idPedido/marcadores"](
      {
        idPedido,
      },
      {
        body: requestBody,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Erro ao criar marcador: ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error(
      `Erro ao criar marcador para o pedido ID ${props.idPedido}:`,
      error,
    );
    throw error;
  }
};

export default action;
