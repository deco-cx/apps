import type { AppContext } from "../../mod.ts";
import type { DailyNoteAppendParams } from "../../client.ts";

export interface Props {
  /**
   * @title Graph ID
   * @description ID of the graph to append the daily note to
   */
  graphId: string;

  /**
   * @title Date
   * @description Date of the daily note (ISO 8601 format, e.g., 2023-01-01). Defaults to today.
   */
  date?: string;

  /**
   * @title Text
   * @description Text to append to the daily note
   */
  text: string;

  /**
   * @title List Name
   * @description Name of the list to append to. To backlink, use the format [[List Name]].
   */
  list_name?: string;
}

/**
 * @name AppendToDailyNote
 * @title Append To Daily Note
 * @description Appends text to a daily note in a specific graph.
 */
export default async function appendToDailyNote(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean }> {
  const { graphId, ...noteData } = props;

  const params: DailyNoteAppendParams = {
    ...noteData,
    transform_type: "list-append",
  };

  return await ctx.reflect.appendToDailyNote(graphId, params);
}
