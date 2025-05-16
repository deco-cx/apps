import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description ID of the product
   */
  idProduto: number;
}

interface ProdutoResponse {
  id: number;
  codigo?: string;
  nome: string;
  preco: number;
  precoCusto?: number;
  descricao?: string;
  unidade?: string;
  peso?: number;
  gtin?: string;
  idMarca?: number;
  idCategoria?: number;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao?: string;
}

/**
 * @title Get Product Details
 * @description Retrieves details of a specific product
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ProdutoResponse> => {
  try {
    const { idProduto } = props;

    const response = await ctx.api["GET /produtos/:idProduto"]({
      idProduto,
    });

    return await response.json();
  } catch (error) {
    console.error("Error getting product details:", error);
    throw error;
  }
};

export default loader;
