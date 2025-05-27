import { AppContext } from "../../mod.ts";
import { CriarOrdemCompraRequestModel } from "../../types.ts";

export interface Props extends CriarOrdemCompraRequestModel {}

/**
 * @title Criar Ordem de Compra
 * @description Cria uma nova ordem de compra
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ id: number; numero: string }> => {
  try {
    const response = await ctx.api["POST /ordem-compra"]({}, {
      body: props,
    });

    return await response.json();
  } catch (error) {
    console.error("Erro ao criar ordem de compra:", error);
    throw error;
  }
};

export default action;
