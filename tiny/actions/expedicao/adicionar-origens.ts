import { AppContext } from "../../mod.ts";
import {
  AdicionarOrigemExpedicaoRequestModel,
  ExpedicaoOrigemModel,
} from "../../types.ts";

export interface Props {
  /**
   * @title ID do Agrupamento
   * @description Identificador único do agrupamento de expedição
   */
  idAgrupamento: number;

  /**
   * @title Origens
   * @description Lista de origens a serem adicionadas (pedidos ou notas fiscais)
   */
  origens: ExpedicaoOrigemModel[];
}

/**
 * @title Adicionar Origens à Expedição
 * @description Adiciona origens (pedidos ou notas fiscais) a um agrupamento de expedição
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idAgrupamento, origens } = props;
    const requestBody: AdicionarOrigemExpedicaoRequestModel = {
      origens,
    };

    const response = await ctx.api["POST /expedicao/:idAgrupamento/origens"](
      {
        idAgrupamento,
      },
      {
        body: requestBody,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Erro ao adicionar origens: ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error(
      `Erro ao adicionar origens ao agrupamento de expedição ID ${props.idAgrupamento}:`,
      error,
    );
    throw error;
  }
};

export default action;
