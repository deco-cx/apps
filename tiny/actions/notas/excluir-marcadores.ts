import { AppContext } from "../../mod.ts";
import { ExcluirMarcadoresRequestModel } from "../../types.ts";

export interface Props extends ExcluirMarcadoresRequestModel {
  /**
   * @title ID da Nota Fiscal
   * @description ID da nota fiscal para excluir marcadores
   */
  idNota: number;
}

/**
 * @title Excluir Marcadores da Nota Fiscal
 * @description Remove marcadores associados a uma nota fiscal
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idNota, ids } = props;

    await ctx.api["DELETE /notas/:idNota/marcadores"]({
      idNota,
    }, {
      body: { ids },
    });
  } catch (error) {
    console.error("Erro ao excluir marcadores da nota fiscal:", error);
    throw error;
  }
};

export default action;
