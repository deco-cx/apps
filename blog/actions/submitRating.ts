import { and, eq, like, or } from "npm:drizzle-orm@0.30.10";
import { Person } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { logger } from "@deco/deco/o11y";
import { Rating } from "../types.ts";
import { rating } from "../db/schema.ts";

export interface Props {
  itemReviewed: string;
  author: Person;
  ratingValue: number;
  additionalType?: string;
}

export default async function submitRating(
  { itemReviewed, author, ratingValue, additionalType }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Rating | null> {
  const records = await ctx.invoke.records.loaders.drizzle();

  try {
    const storedRating = await records.select({
      id: rating.id,
      itemReviewed: rating.itemReviewed,
      author: rating.author,
      ratingValue: rating.ratingValue,
      additionalType: rating.additionalType,
    })
      .from(rating).where(
        and(
          eq(rating.itemReviewed, itemReviewed),
          or(
            like(rating.author, `%"email":"${author.email}"%`),
            like(rating.author, `%"id":"${author["@id"]}"%`),
          ),
        ),
      ) as Rating[] | undefined;

    //if has data, then update de table
    if (storedRating && storedRating.length > 0 && storedRating?.at(0)?.id) {
      const current = storedRating.at(0)!;
      await records.update(rating).set({
        ratingValue,
        additionalType: additionalType ?? current.additionalType,
      }).where(
        eq(rating.id, current.id!),
      );
      return {
        ...current,
        ratingValue,
        additionalType: additionalType ?? current.additionalType,
      };
    }

    const insertedData = {
      itemReviewed,
      author: author!,
      ratingValue: ratingValue!,
      additionalType: additionalType,
    };

    await records.insert(rating).values({
      ...insertedData,
    });

    return {
      "@type": "Rating",
      ...insertedData,
    };
  } catch (e) {
    logger.error(e);
    return null;
  }
}
