import { AppContext } from "../../mod.ts";
import { OrdemServicoResponseModel } from "../../types.ts";

export interface Props {
  /**
   * @title ID da Ordem de Serviço
   * @description ID da ordem de serviço a ser consultada
   */
  idOrdemServico: number;
}

/**
 * @title Obter Ordem de Serviço
 * @description Obtém os detalhes de uma ordem de serviço específica
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<OrdemServicoResponseModel> => {
  try {
    const { idOrdemServico } = props;

    const response = await ctx.api["GET /ordem-servico/:idOrdemServico"]({
      idOrdemServico,
    });

    return await response.json();
  } catch (error) {
    console.error("Erro ao obter ordem de serviço:", error);
    throw error;
  }
};

export default loader;
