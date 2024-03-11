
import { ProductDetailsPage, AggregateRating } from "../../commerce/types.ts";
import { ExtensionOf } from "../../website/loaders/extension.ts";
import { AppContext } from "../mod.ts";


export interface Props {
  productId?: string;
}

/**
 * @title Your Views - Product Details Page
 */
export default function productDetailsPage(
  _props: Props,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<ProductDetailsPage | null> {

  const { api } = ctx;


  return async (productDetailsPage: ProductDetailsPage | null) => {

    if (!productDetailsPage) {
      return null;
    } 

    console.log("id", productDetailsPage?.product.inProductGroupWithID)

    const pageReview = await api["GET /api/v2/pub/review/:productId"]({
      productId: productDetailsPage?.product.inProductGroupWithID || "",
    }).then((res) => res.json())

    console.log("pageReview", pageReview)

    // TODO: implement a separated function at transform.ts
    const aggregateRating : AggregateRating = {
      "@type": "AggregateRating",
      ratingCount: pageReview.Element.TotalRatings,
      reviewCount: pageReview.Total,
      ratingValue: pageReview.Element.Rating,
      bestRating: 5, // TODO: find best rating
      worstRating: 0, // TODO: find worst rating
    }

    // TODO: implement review transformation

    return {
      ...productDetailsPage,
      product: {
        ...productDetailsPage.product,
        aggregateRating,
      },
    }
  };
}
