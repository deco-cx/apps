import { eq } from "https://esm.sh/drizzle-orm@0.30.10";
import { Person } from "../../commerce/types.ts";
import { comments } from "../db/schema.ts";
import { AppContext } from "../mod.ts";
import { logger } from "@deco/deco/o11y";
import { ArticleComment } from "../types.ts";
import { getCommentById } from "../utils/records.ts";

export interface Props {
  action: "create" | "update";
  postSlug?: string;
  person?: Person;
  status?: "submited" | "deleted";
  id?: string;
  comment?: string;
}

export interface SubmitResult {
  success: boolean;
  message?: string;
}

export default async function submitComment(
  { postSlug, person, status, id, comment, action }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ArticleComment | null> {
  const isoDate = new Date().toISOString().split("T")[0];
  const records = await ctx.invoke.records.loaders.drizzle();

  try {
    if (action != "create") {
      const storedComment = await getCommentById({ ctx, id });
      if (!storedComment) {
        return null;
      }
      const updateRecord = {
        status: status ?? storedComment.status,
        comment: comment ?? storedComment.comment,
        dateModified: isoDate,
      };
      await records.update(comments).set({
        ...updateRecord,
      }).where(
        eq(comments.id, id!),
      );

      return {
        ...updateRecord,
        person: person ?? storedComment.person,
        datePublished: storedComment.datePublished,
      };
    }

    const insertData = {
      person: person!,
      status: status!,
      comment: comment!,
      datePublished: isoDate,
      dateModified: isoDate,
    };

    await records.insert(comments).values({
      postSlug,
      ...insertData,
    });

    return insertData;
  } catch (e) {
    logger.error(e);
    return null;
  }
}
