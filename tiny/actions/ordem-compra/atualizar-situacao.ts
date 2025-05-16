import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title ID da Ordem de Compra
   * @description ID da ordem de compra a ser atualizada
   */
  idOrdemCompra: number;

  /**
   * @title Situação
   * @description Nova situação da ordem de compra
   */
  situacao: string;
}

/**
 * @title Atualizar Situação da Ordem de Compra
 * @description Atualiza a situação de uma ordem de compra existente
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idOrdemCompra, situacao } = props;

    await ctx.api["PUT /ordem-compra/:idOrdemCompra/situacao"]({
      idOrdemCompra,
    }, {
      body: { situacao },
    });
  } catch (error) {
    console.error("Erro ao atualizar situação da ordem de compra:", error);
    throw error;
  }
};

export default action;
