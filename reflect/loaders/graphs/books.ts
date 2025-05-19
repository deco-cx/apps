import type { AppContext } from "../../mod.ts";
import type { Book } from "../../client.ts";

export interface Props {
  /**
   * @title Graph ID
   * @description ID of the graph to get books from
   */
  graphId: string;
}

/**
 * @name GetBooks
 * @title Get Books
 * @description Fetches all books from a specific graph.
 */
export default async function getBooks(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Book[]> {
  return await ctx.reflect.getBooks(props.graphId);
}
