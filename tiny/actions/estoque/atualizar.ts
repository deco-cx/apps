import { AppContext } from "../../mod.ts";

export interface Props {
  idProduto: number;
  quantidade: number;
  localizacao?: string;
  observacao?: string;
}

interface EstoqueResponse {
  id: number;
  idProduto: number;
  nomeProduto: string;
  quantidade: number;
  localizacao?: string;
  ultimaAtualização: string;
}

/**
 * @title Update Product Stock
 * @description Updates stock information for a specific product
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<EstoqueResponse> => {
  try {
    const { idProduto, ...body } = props;

    const response = await ctx.api["POST /estoque/:idProduto"]({
      idProduto,
    }, {
      body,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update product stock: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating product stock:", error);
    throw error;
  }
};

export default action;
