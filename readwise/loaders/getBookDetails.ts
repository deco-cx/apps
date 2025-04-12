import { AppContext } from "../mod.ts";
import type { Book } from "../client.ts";

export interface Props {
  /**
   * @title Book ID
   * @description The ID of the book to fetch details for
   */
  id: number;
}

/**
 * @title Get Book Details
 * @description Fetches detailed information about a specific book
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Book> => {
  const { id } = props;

  // Make the API request
  const response = await ctx.api["GET /books/:id"]({ id });
  const data = await response.json();

  return data;
};

export default loader;
