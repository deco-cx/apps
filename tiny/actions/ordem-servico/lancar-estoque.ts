import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title ID da Ordem de Serviço
   * @description ID da ordem de serviço para lançar estoque
   */
  idOrdemServico: number;
}

/**
 * @title Lançar Estoque da Ordem de Serviço
 * @description Lança o estoque de uma ordem de serviço
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idOrdemServico } = props;

    await ctx.api["POST /ordem-servico/:idOrdemServico/lancar-estoque"]({
      idOrdemServico,
    });
  } catch (error) {
    console.error("Erro ao lançar estoque da ordem de serviço:", error);
    throw error;
  }
};

export default action;
