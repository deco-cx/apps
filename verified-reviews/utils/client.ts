import { fetchAPI } from "../../utils/fetch.ts";
import { Ratings, Reviews, VerifiedReviewsFullReview } from "./types.ts";
import { Product } from "../../commerce/types.ts";
import { ConfigVerifiedReviews } from "../mod.ts";
import { context } from "deco/live.ts";

export type ClientVerifiedReviews = ReturnType<typeof createClient>;

export interface PaginationOptions {
  count?: number;
  offset?: number;
  order?:
    | "date_desc"
    | "date_ASC"
    | "rate_DESC"
    | "rate_ASC"
    | "helpfulrating_DESC";
}

const MessageError = {
  ratings:
    "🔴⭐ Error on call ratings of Verified Review - probably unidentified product",
  rating:
    "🔴⭐ Error on call single rating of Verified Review - probably unidentified product",
  fullReview:
    "🔴⭐ Error on call Full Review of Verified Review - probably unidentified product",
};

const baseUrl = "https://awsapis3.netreviews.eu/product";

export const createClient = (params: ConfigVerifiedReviews | undefined) => {
  if (!params) return;

  const { idWebsite } = params;

  /** @description https://documenter.getpostman.com/view/2336519/SVzw6MK5#338f8f1b-4379-40a2-8893-080fe5234679 */
  const rating = async ({ productId }: { productId: string }) => {
    const payload = {
      query: "average",
      products: [productId],
      idWebsite: idWebsite,
      plateforme: "br",
    };

    try {
      const data = await fetchAPI<Ratings>(`${baseUrl}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return Object.keys(data).length ? data : undefined;
    } catch (error) {
      if (context.isDeploy) {
        console.error(MessageError.rating, error);
      } else {
        throw new Error(`${MessageError.rating} - ${error}`);
      }
      return undefined;
    }
  };

  /** @description https://documenter.getpostman.com/view/2336519/SVzw6MK5#6d8ab05a-28b6-48b3-9e8f-6bbbc046619a */
  const ratings = async ({ productsIds }: { productsIds: string[] }) => {
    const payload = {
      query: "average",
      products: productsIds,
      idWebsite: idWebsite,
      plateforme: "br",
    };
    try {
      const data = await fetchAPI<Ratings>(`${baseUrl}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return Object.keys(data).length ? data : undefined;
    } catch (error) {
      if (context.isDeploy) {
        console.error(MessageError.ratings, error);
      } else {
        console.log(`${MessageError.ratings} - ${error}`);
        return undefined;
      }
      return undefined;
    }
  };

  /** @description https://documenter.getpostman.com/view/2336519/SVzw6MK5#daf51360-c79e-451a-b627-33bdd0ef66b8 */
  const reviews = ({
    productId,
    count = 5,
    offset = 0,
    order = "date_desc",
  }: PaginationOptions & {
    productId: string;
  }) => {
    const payload = {
      query: "reviews",
      product: productId,
      idWebsite: idWebsite,
      plateforme: "br",
      offset: offset,
      limit: count,
      order: order,
    };

    return fetchAPI<Reviews>(`${baseUrl}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const fullReview = async ({
    productId,
    count = 5,
    offset = 0,
  }: PaginationOptions & {
    productId: string;
  }): Promise<VerifiedReviewsFullReview> => {
    try {
      const response = await Promise.all([
        rating({ productId }),
        reviews({ productId, count, offset }),
      ]);

      const [responseRating, responseReview] = response.flat() as [
        Ratings,
        Reviews | null,
      ];

      const currentRating = responseRating?.[productId]?.[0];
      return {
        aggregateRating: currentRating
          ? {
            "@type": "AggregateRating",
            ratingValue: Number(parseFloat(currentRating.rate).toFixed(1)),
            reviewCount: Number(currentRating.count),
          }
          : undefined,
        review: responseReview
          ? responseReview.reviews?.map((item) => ({
            "@type": "Review",
            author: [
              {
                "@type": "Author",
                name: `${item.firstname} ${item.lastname}`,
              },
            ],
            datePublished: item.review_date,
            reviewBody: item.review,
            reviewRating: {
              "@type": "AggregateRating",
              ratingValue: Number(item.rate),
              // this api does not support multiple reviews
              reviewCount: 1,
            },
          }))
          : [],
      };
    } catch (error) {
      if (context.isDeploy) {
        console.error(MessageError.ratings, error);
      } else {
        throw new Error(`${MessageError.fullReview} - ${error}`);
      }
      return {
        aggregateRating: undefined,
        review: [],
      };
    }
  };

  const storeReview = async (): Promise<Reviews["reviews"] | null> => {
    try {
      const response = await fetchAPI<Reviews["reviews"]>(
        `https://cl.avis-verifies.com/br/cache/8/6/a/${idWebsite}/AWS/WEBSITE_API/reviews.json`,
        {
          method: "GET",
        },
      );

      return (
        response ? response : []
      );
    } catch (error) {
      if (context.isDeploy) {
        console.error(MessageError.ratings, error);
      } else {
        throw new Error(`${MessageError.ratings} - ${error}`);
      }
      return null;
    }
  };

  return {
    rating,
    ratings,
    reviews,
    fullReview,
    storeReview,
  };
};

export const getProductId = (product: Product) =>
  product.isVariantOf!.productGroupID;
