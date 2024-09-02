import { Product } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import type { AppContext } from "../../mod.ts";
import { ProductDetailsResponse } from "../../utils/types.ts";
import { convertProductData } from "../../utils/transform.ts";

export interface Props {
  /** @description Product codes. */
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
): Promise<Product[]> => {
  const { api } = ctx;
  const { productCodes } = props;

  return Promise.all(
    productCodes.map(async (productCode) => {
      const data: ProductDetailsResponse = await api[
        "GET /products/:productCode"
      ]({ productCode }, STALE).then((res: Response) => res.json());

      const product = convertProductData(data);

      return product;
    }),
  );
};

export default productListLoader;
