import { AppContext } from "../mod.ts";
import type { ExportResultItem } from "../client.ts";

export interface Props {
  /**
   * @title Updated After
   * @description Fetch only highlights updated after this date (ISO 8601 format)
   */
  updatedAfter?: string;

  /**
   * @title Book IDs
   * @description Comma-separated list of book IDs to fetch highlights from
   */
  ids?: string;
}

/**
 * @title Export All Highlights
 * @description Fetches all highlights from Readwise with pagination support
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ExportResultItem[]> => {
  const { updatedAfter, ids } = props;

  // Store all results from all pages
  let allResults: ExportResultItem[] = [];
  let nextPageCursor: string | null = null;

  // Loop until we have fetched all pages
  do {
    // Prepare search parameters for the current request
    const searchParams: Record<string, string> = {};
    if (updatedAfter) {
      searchParams.updatedAfter = updatedAfter;
    }
    if (ids) {
      searchParams.ids = ids;
    }
    if (nextPageCursor) {
      searchParams.pageCursor = nextPageCursor;
    }

    // Make the API request
    const response = await ctx.api["GET /export/"](searchParams);
    const data = await response.json();

    // Add the results to our collection
    allResults = [...allResults, ...data.results];

    // Update the next page cursor for the next iteration
    nextPageCursor = data.nextPageCursor;
  } while (nextPageCursor);

  return allResults;
};

export default loader;
