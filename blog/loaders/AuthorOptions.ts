import { AppContext } from "../mod.ts";
import { Author } from "./Author.ts";
import { getRecordsByPath } from "../utils/records.ts";

const COLLECTION_PATH = "collections/blog/authors";
const ACCESSOR = "author";

/**
 * @title AuthorOptions
 * @description Fetches all available options
 *
 * Fetches a specific author by identifier.
 *
 * @param props - The props (unused).
 * @param _req - The request object (unused).
 * @param ctx - The application context.
 * @returns A promise that resolves to the author or null if not found.
 */
export default async function AuthorItem(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<
  {
    label: string;
    value: string;
  }[]
> {
  const authors = await getRecordsByPath<Author>(
    ctx,
    COLLECTION_PATH,
    ACCESSOR,
  );

  return authors.map((author) => ({
    label: author.name,
    value: JSON.stringify(author),
  }));
}
