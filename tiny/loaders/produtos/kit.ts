import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Product ID
   */
  idProduto: number;
}

interface KitItem {
  idProduto: number;
  nome: string;
  quantidade: number;
  valorUnitario: number;
}

/**
 * @title Get Product Kit Items
 * @description Retrieves the list of products that make up a kit product
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<KitItem[]> => {
  try {
    const { idProduto } = props;
    const response = await ctx.api["GET /produtos/:idProduto/kit"]({
      idProduto,
    });

    return await response.json();
  } catch (error) {
    console.error(
      `Error retrieving kit items for product ID ${props.idProduto}:`,
      error,
    );
    throw error;
  }
};

export default loader;
