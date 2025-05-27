import { AppContext } from "../mod.ts";
import type { Highlight, PaginatedResponse } from "../client.ts";

export interface Props {
  /**
   * @title Page Size
   * @description Number of results per page (default: 100, max: 1000)
   */
  pageSize?: number;

  /**
   * @title Page
   * @description Page number for pagination
   */
  page?: number;

  /**
   * @title Book ID
   * @description Filter highlights by book ID
   */
  bookId?: number;

  /**
   * @title Updated Before
   * @description Filter by last updated datetime (less than) in ISO format
   */
  updatedBefore?: string;

  /**
   * @title Updated After
   * @description Filter by last updated datetime (greater than) in ISO format
   */
  updatedAfter?: string;

  /**
   * @title Highlighted Before
   * @description Filter by highlight datetime (less than) in ISO format
   */
  highlightedBefore?: string;

  /**
   * @title Highlighted After
   * @description Filter by highlight datetime (greater than) in ISO format
   */
  highlightedAfter?: string;
}

/**
 * @title List Highlights
 * @description Fetches a paginated list of highlights with filtering options
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PaginatedResponse<Highlight>> => {
  const {
    pageSize,
    page,
    bookId,
    updatedBefore,
    updatedAfter,
    highlightedBefore,
    highlightedAfter,
  } = props;

  // Prepare search parameters
  const searchParams: Record<string, string | number> = {};

  if (pageSize) {
    searchParams.page_size = pageSize;
  }

  if (page) {
    searchParams.page = page;
  }

  if (bookId) {
    searchParams.book_id = bookId;
  }

  if (updatedBefore) {
    searchParams.updated__lt = updatedBefore;
  }

  if (updatedAfter) {
    searchParams.updated__gt = updatedAfter;
  }

  if (highlightedBefore) {
    searchParams.highlighted_at__lt = highlightedBefore;
  }

  if (highlightedAfter) {
    searchParams.highlighted_at__gt = highlightedAfter;
  }

  // Make the API request
  const response = await ctx.api["GET /highlights/"](searchParams);
  const data = await response.json();

  return data;
};

export default loader;
