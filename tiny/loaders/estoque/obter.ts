import { AppContext } from "../../mod.ts";

export interface Props {
  idProduto: number;
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
 * @title Get Product Stock
 * @description Gets stock information for a specific product
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<EstoqueResponse> => {
  try {
    const { idProduto } = props;

    const response = await ctx.api["GET /estoque/:idProduto"]({
      idProduto,
    });

    return await response.json();
  } catch (error) {
    console.error("Error getting product stock:", error);
    throw error;
  }
};

export default loader;
