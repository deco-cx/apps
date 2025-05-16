import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title ID da Ordem de Serviço
   * @description ID da ordem de serviço a ser atualizada
   */
  idOrdemServico: number;

  /**
   * @title Situação
   * @description Nova situação da ordem de serviço
   */
  situacao: string;
}

/**
 * @title Atualizar Situação da Ordem de Serviço
 * @description Atualiza a situação de uma ordem de serviço existente
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idOrdemServico, situacao } = props;

    await ctx.api["PUT /ordem-servico/:idOrdemServico/situacao"]({
      idOrdemServico,
    }, {
      body: { situacao },
    });
  } catch (error) {
    console.error("Erro ao atualizar situação da ordem de serviço:", error);
    throw error;
  }
};

export default action;
