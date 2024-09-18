import { rating, review } from "../db/schema.ts";
import { AppContext } from "../mod.ts";
import { type Resolvable } from "@deco/deco";
import { eq } from "https://esm.sh/drizzle-orm@0.30.10";
import { BlogPost, Rating, Review } from "../types.ts";
import { logger } from "@deco/deco/o11y";

export async function getRecordsByPath<T>(
  ctx: AppContext,
  path: string,
  accessor: string,
): Promise<T[]> {
  const resolvables: Record<string, Resolvable<T>> = await ctx.get({
    __resolveType: "resolvables",
  });
  const current = Object.entries(resolvables).flatMap(([key, value]) => {
    return key.startsWith(path) ? value : [];
  });
  return (current as Record<string, T>[]).map((item) => item[accessor]);
}

export async function getRatingsBySlug(
  { ctx, slug }: { ctx: AppContext; slug: string },
): Promise<Rating[]> {
  const records = await ctx.invoke.records.loaders.drizzle();
  try {
    const currentRatings = await records.select({
      id: rating.id,
      itemReviewed: rating.itemReviewed,
      author: rating.author,
      ratingValue: rating.ratingValue,
      additionalType: rating.additionalType,
    })
      .from(rating).where(eq(rating.itemReviewed, slug)) as
        | Rating[]
        | undefined;

    return currentRatings?.length === 0 || !currentRatings
      ? []
      : currentRatings.map((rating) => ({
        ...rating,
        bestRating: 5,
        worstRating: 1,
      }));
  } catch (e) {
    logger.error(e);
    return [];
  }
}

export async function getRatings(
  { ctx, post }: { ctx: AppContext; post: BlogPost },
): Promise<BlogPost> {
  const contentRating = await getRatingsBySlug({
    ctx,
    slug: post.slug,
  });

  const ratingValue = contentRating.length === 0 ? 0 : contentRating.reduce(
    (acc, rating) => acc = acc + rating!.ratingValue!,
    0,
  ) / contentRating.length;

  return {
    ...post,
    contentRating,
    aggregateRating: {
      ...post.aggregateRating,
      "@type": "AggregateRating",
      ratingCount: contentRating.length,
      bestRating: 5,
      worstRating: 1,
      ratingValue,
    },
  };
}

export const getReviewById = async (
  { ctx, id }: { ctx: AppContext; id?: string },
): Promise<Review | null> => {
  if (!id) {
    return null;
  }
  const records = await ctx.invoke.records.loaders.drizzle();
  try {
    const targetReview = await records.select({
      itemReviewed: review.itemReviewed,
      author: review.author,
      datePublished: review.datePublished,
      dateModified: review.dateModified,
      reviewBody: review.reviewBody,
      reviewHeadline: review.reviewHeadline,
      isAnonymous: review.isAnonymous,
      additionalType: review.additionalType,
      id: review.id,
    })
      .from(review).where(eq(review.id, id)).get() as Review | undefined;
    return targetReview ?? null;
  } catch (e) {
    logger.error(e);
    return null;
  }
};

export async function getReviewsBySlug(
  { ctx, slug }: { ctx: AppContext; slug: string },
): Promise<Review[]> {
  const records = await ctx.invoke.records.loaders.drizzle();
  try {
    const currentComments = await records.select({
      itemReviewed: review.itemReviewed,
      author: review.author,
      datePublished: review.datePublished,
      dateModified: review.dateModified,
      reviewBody: review.reviewBody,
      reviewHeadline: review.reviewHeadline,
      isAnonymous: review.isAnonymous,
      additionalType: review.additionalType,
      id: review.id,
    })
      .from(review).where(eq(review.itemReviewed, slug)) as
        | Review[]
        | undefined;

    return currentComments ?? [];
  } catch (e) {
    logger.error(e);
    return [];
  }
}

export async function getReviews(
  { ctx, post }: { ctx: AppContext; post: BlogPost },
): Promise<BlogPost> {
  const review = await getReviewsBySlug({
    ctx,
    slug: post.slug,
  });

  return {
    ...post,
    review,
    aggregateRating: {
      ...post.aggregateRating,
      "@type": "AggregateRating",
      reviewCount: review.length,
    },
  };
}
