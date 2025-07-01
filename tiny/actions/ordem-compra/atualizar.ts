import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title ID da Ordem de Compra
   * @description ID da ordem de compra a ser atualizada
   */
  idOrdemCompra: number;

  /**
   * @title Número
   * @description Número da ordem de compra
   */
  numero?: string;

  /**
   * @title Data
   * @description Data da ordem de compra (formato YYYY-MM-DD)
   */
  data?: string;

  /**
   * @title Situação
   * @description Situação da ordem de compra
   */
  situacao?: string;

  /**
   * @title Observação
   * @description Observações sobre a ordem de compra
   */
  observacao?: string;
}

/**
 * @title Atualizar Ordem de Compra
 * @description Atualiza uma ordem de compra existente
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idOrdemCompra, ...requestBody } = props;

    await ctx.api["PUT /ordem-compra/:idOrdemCompra"]({
      idOrdemCompra,
    }, {
      body: requestBody,
    });
  } catch (error) {
    console.error("Erro ao atualizar ordem de compra:", error);
    throw error;
  }
};

export default action;
