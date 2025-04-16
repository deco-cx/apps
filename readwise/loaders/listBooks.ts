import { AppContext } from "../mod.ts";
import type { Book, PaginatedResponse } from "../client.ts";

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
   * @title Category
   * @description Filter books by category (books, articles, tweets, supplementals or podcasts)
   */
  category?: "books" | "articles" | "tweets" | "supplementals" | "podcasts";

  /**
   * @title Source
   * @description Filter books by source (e.g. kindle, api_article, etc.)
   */
  source?: string;

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
   * @title Last Highlight Before
   * @description Filter by the time when the last highlight was taken (less than) in ISO format
   */
  lastHighlightBefore?: string;

  /**
   * @title Last Highlight After
   * @description Filter by the time when the last highlight was taken (greater than) in ISO format
   */
  lastHighlightAfter?: string;
}

/**
 * @title List Books
 * @description Fetches a paginated list of books with filtering options
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PaginatedResponse<Book>> => {
  const {
    pageSize,
    page,
    category,
    source,
    updatedBefore,
    updatedAfter,
    lastHighlightBefore,
    lastHighlightAfter,
  } = props;

  // Prepare search parameters
  const searchParams: Record<string, string | number> = {};

  if (pageSize) {
    searchParams.page_size = pageSize;
  }

  if (page) {
    searchParams.page = page;
  }

  if (category) {
    searchParams.category = category;
  }

  if (source) {
    searchParams.source = source;
  }

  if (updatedBefore) {
    searchParams.updated__lt = updatedBefore;
  }

  if (updatedAfter) {
    searchParams.updated__gt = updatedAfter;
  }

  if (lastHighlightBefore) {
    searchParams.last_highlight_at__lt = lastHighlightBefore;
  }

  if (lastHighlightAfter) {
    searchParams.last_highlight_at__gt = lastHighlightAfter;
  }

  // Make the API request
  const response = await ctx.api["GET /books/"](searchParams);
  const data = await response.json();

  return data;
};

export default loader;
