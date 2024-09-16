import { and, eq, like, or } from "https://esm.sh/drizzle-orm@0.30.10";
import { Person } from "../../commerce/types.ts";
import { reactions, ReactionSchema } from "../db/schema.ts";
import { AppContext } from "../mod.ts";
import { logger } from "@deco/deco/o11y";

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
): Promise<SubmitResult> {
  const isoDate = new Date().toISOString().split("T")[0];
  const records = await ctx.invoke.records.loaders.drizzle();

  try {
    const currentReaction = await records.select({
      postSlug: reactions.postSlug,
      person: reactions.person,
      action: reactions.action,
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

    if (currentReaction.length > 0 && currentReaction[0].id) {
      const { id } = currentReaction[0]!;
      await records.update(reactions).set({
        action: action,
        dateModified: isoDate,
      }).where(
        eq(reactions.id, id),
      );
      return {
        success: true,
      };
    }

    await records.insert(reactions).values({
      postSlug: postSlug,
      person: person,
      datePublished: isoDate,
      dateModified: isoDate,
      action: action,
    });

    return {
      success: true,
    };
  } catch (e) {
    logger.error(e);
    return {
      success: false,
      message: e,
    };
  }
}
