import { AppContext } from "../../../mod.ts";

export interface Props {
  idProduto: number;
  preco: number;
}

interface PrecoProdutoResponse {
  id: number;
  preco: number;
  dataAtualizacao: string;
}

/**
 * @title Update Product Price
 * @description Updates the price of a specific product
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PrecoProdutoResponse> => {
  try {
    const { idProduto, preco } = props;

    const response = await ctx.api["PUT /produtos/:idProduto/preco"]({
      idProduto,
    }, {
      body: { preco },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update product price: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating product price:", error);
    throw error;
  }
};

export default action;
