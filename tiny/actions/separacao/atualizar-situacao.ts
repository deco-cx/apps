import { AppContext } from "../../mod.ts";
import { AtualizarSituacaoSeparacaoRequestModel } from "../../types.ts";

export interface Props extends AtualizarSituacaoSeparacaoRequestModel {
  /**
   * @title ID da Separação
   * @description ID da separação a ser atualizada
   */
  idSeparacao: number;
}

/**
 * @title Atualizar Situação da Separação
 * @description Atualiza a situação de uma separação específica
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idSeparacao, situacao } = props;

    await ctx.api["PUT /separacao/:idSeparacao/situacao"]({
      idSeparacao,
    }, {
      body: { situacao },
    });
  } catch (error) {
    console.error("Erro ao atualizar situação da separação:", error);
    throw error;
  }
};

export default action;
