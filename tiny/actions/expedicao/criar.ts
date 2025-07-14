import { AppContext } from "../../mod.ts";
import {
  CriarAgrupamentoExpedicaoRequestModel,
  CriarAgrupamentoExpedicaoResponseModel,
} from "../../types.ts";

export interface Props extends CriarAgrupamentoExpedicaoRequestModel {
  // No additional props needed
}

/**
 * @title Criar Agrupamento de Expedição
 * @description Cria um novo agrupamento de expedição
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CriarAgrupamentoExpedicaoResponseModel> => {
  try {
    const { nome, descricao } = props;

    const response = await ctx.api["POST /expedicao"](
      {}, // No path params
      {
        body: {
          nome,
          descricao,
        },
      },
    );

    return await response.json();
  } catch (error) {
    console.error("Erro ao criar agrupamento de expedição:", error);
    throw error;
  }
};

export default action;
