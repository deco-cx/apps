import { Product } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { ProductDetailsResponse } from "../../utils/types.ts";
import { convertProductData } from "../../utils/transform.ts";

export interface Props {
  /**
   * @title Product codes
   * @description List of product codes for shelf products.
   */
  productCodes: string[];
}

/**
 * @title SAP Integration
 * @description Product List loader
 */
const productListLoader = (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const { api } = ctx;
  const { productCodes } = props;

  return Promise.all(
    productCodes.map(async (productCode) => {
      const data: ProductDetailsResponse = await api[
        "GET /products/:productCode"
      ]({ productCode }).then((res: Response) => res.json());

      const product = convertProductData(data);

      return product;
    }),
  );
};

export default productListLoader;
