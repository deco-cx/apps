import { AppContext } from "../mod.ts";
import { ProductListingPage } from "../../commerce/types.ts";
import { ExtensionOf } from "../../website/loaders/extension.ts";
import { toAggregateRating, toPowerReviewId } from "../utils/tranform.ts";

export interface Props {
  /**
   * @title Prop Id
   * @description Which prop in your product is your power review id?
   */
  propId?: "id" | "sku" | "model";

  /**
   * @title Page Size
   * @description Quantity of reviews
   */
  pageSize?: number;
}

/**
 * @title Power Reviews - Product Listing Page
 */
export default function productListingPage(
  props: Props,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<ProductListingPage | null> {
  const { api, merchantId } = ctx;
  const { propId, pageSize = 1 } = props;
  const pageFrom = 0;

  return async (productListingPage: ProductListingPage | null) => {
    if (!productListingPage) {
      return null;
    }

    const { products } = productListingPage;

    const pageIds = products?.map((product) =>
      toPowerReviewId(propId, product)
    );

    const fullReviewsPromises = pageIds.map((pageId) =>
      api["GET /m/:merchantId/l/:locale/product/:pageId/reviews"]({
        merchantId: merchantId,
        locale: "en_US",
        pageId: pageId || "",
        _noconfig: "true",
        image_only: false,
        "paging.from": pageFrom,
        "paging.size": pageSize,
      })
    );

    const fullReviewsResponse = await Promise.allSettled(fullReviewsPromises);

    const fullReviewsResults = await Promise.allSettled(
      fullReviewsResponse.map((response) => {
        if (response.status === "fulfilled") {
          return response.value.json();
        } else {
          return null;
        }
      }),
    );

    const productsExtendeds = fullReviewsResults.map((result, idx) => {
      if (result.status === "fulfilled" && result.value) {
        return {
          ...products[idx],
          aggregateRating: toAggregateRating(result.value.results[0].rollup),
        };
      } else {
        return products[idx];
      }
    });

    return {
      ...productListingPage,
      products: productsExtendeds,
    };
  };
}
