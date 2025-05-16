import { AppContext } from "../../mod.ts";

export interface Props {
  idProduto: number;
  codigo?: string;
  nome?: string;
  preco?: number;
  precoCusto?: number;
  descricao?: string;
  unidade?: string;
  peso?: number;
  gtin?: string;
  idMarca?: number;
  idCategoria?: number;
  ativo?: boolean;
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
  dataAtualizacao: string;
}

/**
 * @title Update Product
 * @description Updates a specific product
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ProdutoResponse> => {
  try {
    const { idProduto, ...body } = props;

    const response = await ctx.api["PUT /produtos/:idProduto"]({
      idProduto,
    }, {
      body,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update product: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export default action;
