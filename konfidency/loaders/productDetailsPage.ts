import { ProductDetailsPage } from "../../commerce/types.ts";
import { ExtensionOf } from "../../website/loaders/extension.ts";
import { AppContext } from "../mod.ts";
import { toReview } from "../utils/transform.ts";
import { logger } from "@deco/deco/o11y";
export interface Props {
  /**
   * @description Rating type, default: helpfulScore
   * @default "helpfulScore"
   */
  sortField?: "helpfulScore" | "created" | "rating";
  /**
   * @description Default value: asc
   * @default "asc"
   */
  sortOrder?: "asc" | "desc";
  /**
   * @description The default value is 5
   */
  pageSize?: number;
  /**
   * @description The default value is 1
   */
  page?: number;
}
export default function productDetailsPage(
  { pageSize = 5, page = 1, sortField = "helpfulScore", sortOrder = "asc" }:
    Props,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<ProductDetailsPage | null> {
  const { api, customer } = ctx;
  return async (productDetailsPage: ProductDetailsPage | null) => {
    if (!productDetailsPage) {
      return null;
    }
    try {
      const reviews = await api
        ["GET /:customer/:sku/summary/:sortField,:sortOrder"]({
          customer,
          "sortField,:sortOrder": `${sortField},${sortOrder}`,
          page,
          pageSize,
          sku: productDetailsPage.product.inProductGroupWithID as string,
        }).then((res) => res.json());
      const firstSummary = reviews?.reviews?.[0];
      if (!firstSummary) {
        return {
          ...productDetailsPage,
          product: {
            ...productDetailsPage.product,
            aggregateRating: undefined,
            review: [],
          },
        };
      }
      const { aggregateRating, review } = toReview(firstSummary);
      return {
        ...productDetailsPage,
        product: {
          ...productDetailsPage.product,
          aggregateRating,
          review,
        },
      };
    } catch (error) {
      const errorObj = error as { name: string; message: string };
      logger.error(`{ errorName: ${errorObj.name},  
      errorMessage: ${errorObj.message} }`);
      return productDetailsPage;
    }
  };
}
