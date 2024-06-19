import { ProductDetailsPage } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import type { AppContext } from "../../mod.ts";
import {
  FieldsList,
  ProductDetailsResponse,
} from "../../utils/client/types.ts";
import { convertCategoriesToBreadcrumb, convertProductData } from "../../utils/transform.ts";

export interface Props {
  /**
   * @description Response configuration. This is the list of fields that should be returned in the response body. Examples: BASIC, DEFAULT, FULL
   *  @default DEFAULT
   */
  fields?: FieldsList;
  /** @description The product code. */
  productCode: string;
}

/**
 * @title SAP Integration
 * @description Product Details loader
 */
const productDetailsLoader = async (
  props: Props,
  _req: Request,
  ctx: AppContext
): Promise<ProductDetailsPage> => {
  const { api } = ctx;
  const { productCode } = props;

  const data: ProductDetailsResponse = await api[
    "GET /orgProducts/:productCode"
  ]({ productCode }, STALE).then((res) => res.json());

  const breadcrumbList = convertCategoriesToBreadcrumb(data.categories)
  const product = convertProductData(data)

  return {
    "@type": "ProductDetailsPage",
    breadcrumbList,
    product,
  };
};

export default productDetailsLoader;
