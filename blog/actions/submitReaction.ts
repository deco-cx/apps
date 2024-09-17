import { and, eq, like, or } from "https://esm.sh/drizzle-orm@0.30.10";
import { Person } from "../../commerce/types.ts";
import { reactions, ReactionSchema } from "../db/schema.ts";
import { AppContext } from "../mod.ts";
import { logger } from "@deco/deco/o11y";
import { Reaction } from "../types.ts";

export interface Props {
  postSlug: string;
  person: Person;
  action: "like" | "deslike";
}

export interface SubmitResult {
  success: boolean;
  message?: string;
}

export default async function submitReaction(
  { postSlug, person, action }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Reaction | null> {
  const isoDate = new Date().toISOString().split("T")[0];
  const records = await ctx.invoke.records.loaders.drizzle();

  try {
    const storedReaction = await records.select({
      postSlug: reactions.postSlug,
      person: reactions.person,
      action: reactions.action,
      dateModified: reactions.dateModified,
      datePublished: reactions.datePublished,
      id: reactions.id,
    })
      .from(reactions).where(
        and(
          eq(reactions.postSlug, postSlug),
          or(
            like(reactions.person, `%"email":"${person.email}"%`),
            like(reactions.person, `%"id":"${person["@id"]}"%`),
          ),
        ),
      ) as ReactionSchema[];

    //if has data, then update de table
    if (storedReaction.length > 0 && storedReaction?.at(0)?.id) {
      const current = storedReaction.at(0)!;
      await records.update(reactions).set({
        action,
        dateModified: isoDate,
      }).where(
        eq(reactions.id, current.id),
      );
      return {
        ...current,
        action,
        dateModified: isoDate,
      };
    }

    //Or insert more data
    const insertedData = {
      person,
      action,
      datePublished: isoDate,
      dateModified: isoDate,
    };

    await records.insert(reactions).values({
      postSlug: postSlug,
      ...insertedData,
    });

    return insertedData;
  } catch (e) {
    logger.error(e);
    return null;
  }
}
