import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title ID da Nota Fiscal
   * @description ID da nota fiscal para lançar contas
   */
  idNota: number;
}

/**
 * @title Lançar Contas da Nota Fiscal
 * @description Lança as contas a pagar/receber associadas a uma nota fiscal
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idNota } = props;

    await ctx.api["POST /notas/:idNota/lancar-contas"]({
      idNota,
    });
  } catch (error) {
    console.error("Erro ao lançar contas da nota fiscal:", error);
    throw error;
  }
};

export default action;
