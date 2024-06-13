import { STALE } from "../../../utils/fetch.ts";
import type { AppContext } from "../../mod.ts";
import {
  FieldsList,
  ProductDetailsResponse,
} from "../../utils/client/types.ts";

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
): Promise<ProductDetailsResponse> => {
  const { api } = ctx;
  const { productCode } = props;

  const data: ProductDetailsResponse = await api[
    "GET /orgProducts/:productCode"
  ]({ productCode }, STALE).then((res) => res.json());

  return data;
};

export default productDetailsLoader;
