import { AppContext } from "../../mod.ts";
import { AtualizarMarcadoresRequestModel } from "../../types.ts";

export interface Props extends AtualizarMarcadoresRequestModel {
  /**
   * @title ID da Nota Fiscal
   * @description ID da nota fiscal para atualizar marcadores
   */
  idNota: number;
}

/**
 * @title Atualizar Marcadores da Nota Fiscal
 * @description Atualiza os marcadores associados a uma nota fiscal
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idNota, ...requestBody } = props;

    await ctx.api["PUT /notas/:idNota/marcadores"]({
      idNota,
    }, {
      body: requestBody,
    });
  } catch (error) {
    console.error("Erro ao atualizar marcadores da nota fiscal:", error);
    throw error;
  }
};

export default action;
