import { eq } from "npm:drizzle-orm@0.30.10";
import { postViews } from "../db/schema.ts";
import { AppContext } from "../mod.ts";
import { ViewFromDatabase } from "../types.ts";

export interface Props {
  id: string;
}

export default async function action(
  { id }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ count: number }> {
  const records = await ctx.invoke.records.loaders.drizzle();

  const existingRecord = await records.select()
    .from(postViews)
    .where(eq(postViews.id, id))
    .get() as ViewFromDatabase | null;

  if (!existingRecord) {
    await records.insert(postViews).values({
      id,
      userInteractionCount: 1,
    });

    return { count: 1 };
  }

  const newCount = existingRecord.userInteractionCount! + 1;

  await records.update(postViews)
    .set({ userInteractionCount: newCount })
    .where(eq(postViews.id, id));

  return { count: newCount };
}
