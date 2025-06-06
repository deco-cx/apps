import { AppContext } from "../../mod.ts";
import { SeparacaoModel } from "../../types.ts";

export interface Props {
  /**
   * @title ID da Separação
   * @description ID da separação a ser consultada
   */
  idSeparacao: number;
}

/**
 * @title Obter Separação
 * @description Obtém os detalhes de uma separação específica
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SeparacaoModel> => {
  try {
    const { idSeparacao } = props;

    const response = await ctx.api["GET /separacao/:idSeparacao"]({
      idSeparacao,
    });

    return await response.json();
  } catch (error) {
    console.error("Erro ao obter separação:", error);
    throw error;
  }
};

export default loader;
