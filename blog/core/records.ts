import { rating, review } from "../db/schema.ts";
import { AppContext } from "../mod.ts";
import { type Resolvable } from "@deco/deco";
import { and, asc, desc, eq, notInArray } from "npm:drizzle-orm@0.30.10";
import { BlogPost, Ignore, Rating, Review } from "../types.ts";
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
  return (current as Record<string, T>[]).map((item) => {
    const id = (item.name as string).split(path)[1]?.replace("/", "");
    return {
      ...item[accessor],
      id,
    };
  });
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
  { ctx, post, ignoreRatings, onlyAggregate }: {
    ctx: AppContext;
    post: BlogPost;
    ignoreRatings?: Ignore;
    onlyAggregate?: boolean;
  },
): Promise<BlogPost> {
  const contentRating = await getRatingsBySlug({
    ctx,
    slug: post.slug,
  });

  const { ratingCount, ratingTotal } = contentRating.length === 0
    ? { ratingCount: 0, ratingTotal: 0 }
    : contentRating.reduce(
      (acc, { ratingValue, additionalType }) =>
        ignoreRatings?.active && additionalType &&
          ignoreRatings.markedAs?.includes(additionalType)
          ? acc
          : {
            ratingCount: acc.ratingCount + 1,
            ratingTotal: acc.ratingTotal + (ratingValue ?? 0),
          },
      { ratingCount: 0, ratingTotal: 0 },
    );

  const ratingValue = ratingTotal / ratingCount;

  return {
    ...post,
    contentRating: onlyAggregate ? undefined : contentRating,
    aggregateRating: {
      ...post.aggregateRating,
      "@type": "AggregateRating",
      ratingCount,
      ratingValue: isNaN(ratingValue) ? 0 : ratingValue,
      bestRating: 5,
      worstRating: 1,
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
  { ctx, slug, ignoreReviews, orderBy = "date_desc" }: {
    ctx: AppContext;
    slug: string;
    ignoreReviews?: Ignore;
    orderBy?: "date_asc" | "date_desc";
  },
): Promise<Review[]> {
  const records = await ctx.invoke.records.loaders.drizzle();

  const whereClause = ignoreReviews?.active && ignoreReviews?.markedAs &&
      ignoreReviews?.markedAs?.length > 0
    ? and(
      eq(review.itemReviewed, slug),
      notInArray(review.additionalType, ignoreReviews.markedAs),
    )
    : eq(review.itemReviewed, slug);
  const orderClause = orderBy.endsWith("desc")
    ? desc(review.datePublished)
    : asc(review.datePublished);

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
      .from(review).where(whereClause).orderBy(orderClause) as
        | Review[]
        | undefined;

    return currentComments ?? [];
  } catch (e) {
    logger.error(e);
    return [];
  }
}

export async function getReviews(
  { ctx, post, ...rest }: {
    ctx: AppContext;
    post: BlogPost;
    ignoreReviews?: Ignore;
    orderBy?: "date_asc" | "date_desc";
  },
): Promise<BlogPost> {
  const review = await getReviewsBySlug({
    ctx,
    slug: post.slug,
    ...rest,
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
