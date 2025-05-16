import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title ID da Ordem de Serviço
   * @description ID da ordem de serviço para lançar contas
   */
  idOrdemServico: number;
}

/**
 * @title Lançar Contas da Ordem de Serviço
 * @description Lança as contas a receber de uma ordem de serviço
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idOrdemServico } = props;

    await ctx.api["POST /ordem-servico/:idOrdemServico/lancar-contas"]({
      idOrdemServico,
    });
  } catch (error) {
    console.error("Erro ao lançar contas da ordem de serviço:", error);
    throw error;
  }
};

export default action;
