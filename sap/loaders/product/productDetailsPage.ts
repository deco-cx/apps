import { ProductDetailsPage } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { ProductDetailsResponse } from "../../utils/types.ts";
import {
  convertCategoriesToBreadcrumb,
  convertProductData,
} from "../../utils/transform.ts";
import { RequestURLParam } from "../../../website/functions/requestToParam.ts";

export interface Props {
  /**
   * @title Fields
   * @description Response configuration. This is the list of fields that should be returned in the response body. Examples: BASIC, DEFAULT, FULL
   * @default "FULL,averageRating,stock(DEFAULT),description,availableForPickup,code,url,price(DEFAULT),manufacturer,categories(FULL),priceRange,multidimensional,configuratorType,configurable,tags,images(FULL),name,purchasable,baseOptions(DEFAULT),baseProduct,variantOptions(DEFAULT),variantType,numberOfReviews,productReferences,likeProductCopy,likeProductGroup,likeProducts(code,likeProductCopy,likeProductGroup,price(DEFAULT),url,primaryFlag,msrpUSD,msrpCAD,msrpCADFormattedValue),classifications"
   */
  fields: string;
  /**
   * @title Product code
   * @description Product identifier.
   */
  productCode: RequestURLParam;
}

/**
 * @title SAP Integration
 * @description Product Details loader
 */
const productDetailsLoader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> => {
  const { api } = ctx;
  const { fields, productCode } = props;

  const data: ProductDetailsResponse = await api["GET /products/:productCode"]({
    productCode,
    fields,
  }).then((res: Response) => {
    return res.json();
  });

  const breadcrumbList = convertCategoriesToBreadcrumb(data.categories);
  const product = convertProductData(data);

  return {
    "@type": "ProductDetailsPage",
    breadcrumbList,
    product,
  };
};

export default productDetailsLoader;
