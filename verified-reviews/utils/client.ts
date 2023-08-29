import { fetchAPI } from "../../utils/fetch.ts";
import {
  ConfigVerifiedReviews,
  Ratings,
  Reviews,
  VerifiedReviewsFullReview,
} from "./types.ts";

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
      console.warn("⚠ Error on call rating of Verified Review", error);
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
      console.warn("⚠ Error on call ratings of Verified Review", error);
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
    const response = await Promise.all([
      rating({ productId }),
      reviews({ productId, count, offset }),
    ]);

    const [responseRating, responseReview] = response.flat() as [
      Ratings,
      Reviews | null,
    ];

    const currentRating = responseRating[productId]?.[0] || undefined;

    return {
      aggregateRating: currentRating
        ? {
          "@type": "AggregateRating",
          ratingValue: Number(parseFloat(currentRating.rate).toFixed(1)),
          reviewCount: Number(currentRating.count),
        }
        : undefined,
      reviews: responseReview
        ? responseReview.reviews?.map((item) => ({
          "@type": "Review",
          author: item.firstname,
          datePublished: item.review_date,
          reviewBody: item.review,
          reviewRating: {
            "@type": "AggregateRating",
            ratingValue: Number(item.rate),
          },
        }))
        : [],
    };
  };

  return {
    rating,
    ratings,
    reviews,
    fullReview,
  };
};
