import { Product } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { ProductDetailsResponse } from "../../utils/types.ts";
import { convertProductData } from "../../utils/transform.ts";

export interface Props {
  /**
   * @title Fields
   * @description Response configuration. This is the list of fields that should be returned in the response body. Examples: BASIC, DEFAULT, FULL
   * @default "FULL,averageRating,stock(DEFAULT),description,availableForPickup,code,url,price(DEFAULT),manufacturer,categories(FULL),priceRange,multidimensional,configuratorType,configurable,tags,images(FULL),name,purchasable,baseOptions(DEFAULT),baseProduct,variantOptions(DEFAULT),variantType,numberOfReviews,productReferences,likeProductCopy,likeProductGroup,likeProducts(code,likeProductCopy,likeProductGroup,price(DEFAULT),url,primaryFlag,msrpUSD,msrpCAD,msrpCADFormattedValue),classifications"
   */
  fields: string;
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
  const { productCodes, fields } = props;

  return Promise.all(
    productCodes.map(async (productCode) => {
      const data: ProductDetailsResponse = await api[
        "GET /products/:productCode"
      ]({ productCode, fields }).then((res: Response) => res.json());

      const product = convertProductData(data);

      return product;
    }),
  );
};

export default productListLoader;
