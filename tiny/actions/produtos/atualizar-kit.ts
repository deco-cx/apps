import { AppContext } from "../../mod.ts";

export interface KitItemRequest {
  /**
   * @description Product ID to add to the kit
   */
  idProduto: number;

  /**
   * @description Quantity of the product in the kit
   */
  quantidade: number;
}

export interface Props {
  /**
   * @description Product kit ID
   */
  idProduto: number;

  /**
   * @description List of products in the kit
   */
  itens: KitItemRequest[];
}

/**
 * @title Update Product Kit
 * @description Updates the list of products that make up a kit product
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idProduto, itens } = props;

    const response = await ctx.api["PUT /produtos/:idProduto/kit"]({
      idProduto,
    }, {
      body: { itens },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to update product kit: ${JSON.stringify(errorData)}`,
      );
    }

    return;
  } catch (error) {
    console.error(
      `Error updating kit for product ID ${props.idProduto}:`,
      error,
    );
    throw error;
  }
};

export default action;
