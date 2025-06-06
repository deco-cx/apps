import type { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title Graph ID
   * @description ID of the graph to create the note in
   */
  graphId: string;

  /**
   * @title Subject
   * @description Subject/title of the note
   */
  subject: string;

  /**
   * @title Content
   * @description Content of the note in Markdown format
   */
  content_markdown: string;

  /**
   * @title Pinned
   * @description Whether the note should be pinned
   */
  pinned?: boolean;
}

/**
 * @name CreateNote
 * @title Create Note
 * @description Creates a new note in a specific graph.
 */
export default async function createNote(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean }> {
  const { graphId, ...noteData } = props;

  return await ctx.reflect.createNote(graphId, noteData);
}
