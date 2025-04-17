import { eq } from "npm:drizzle-orm@0.30.10";
import { Person } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { logger } from "@deco/deco/o11y";
import { Review } from "../types.ts";
import { getReviewById } from "../core/records.ts";
import { review } from "../db/schema.ts";

export interface Props {
  action: "create" | "update";
  id?: string;
  reviewBody?: string;
  reviewHeadline?: string;
  itemReviewed?: string;
  author?: Person;
  /** Review status */
  additionalType?: string;
  isAnonymous?: boolean;
}

export default async function submitReview(
  {
    reviewBody,
    reviewHeadline,
    itemReviewed,
    id,
    author,
    action,
    additionalType,
    isAnonymous,
  }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Review | null> {
  const isoDate = new Date().toISOString();
  const records = await ctx.invoke.records.loaders.drizzle();

  try {
    if (action != "create") {
      const storedReview = await getReviewById({ ctx, id });
      if (!storedReview) {
        return null;
      }
      const updateRecord = {
        additionalType: additionalType ?? storedReview.additionalType,
        reviewHeadline: reviewHeadline ?? storedReview.reviewHeadline,
        reviewBody: reviewBody ?? storedReview.reviewBody,
        dateModified: isoDate,
      };
      await records.update(review).set({
        ...updateRecord,
      }).where(
        eq(review.id, id!),
      );

      return {
        ...updateRecord,
        "@type": "Review",
        author: author ?? storedReview.author,
        datePublished: storedReview.datePublished,
      };
    }

    const insertData = {
      itemReviewed,
      isAnonymous,
      author: author!,
      additionalType: additionalType,
      reviewHeadline: reviewHeadline,
      reviewBody: reviewBody!,
      datePublished: isoDate,
      dateModified: isoDate,
    };

    await records.insert(review).values({
      ...insertData,
    });

    return {
      "@type": "Review",
      ...insertData,
    };
  } catch (e) {
    logger.error(e);
    return null;
  }
}
