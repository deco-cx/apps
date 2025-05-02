import { AppContext } from "../mod.ts";
import { ISearchParams, ISearchResult } from "../client.ts";

export interface Props {
  /**
   * @title Search Query
   * @description The text to search for
   */
  q: string;

  /**
   * @title Geographic Location
   * @description Geographical location for search results (e.g., "us")
   */
  gl?: string;

  /**
   * @title Language
   * @description Language for search results (e.g., "en")
   */
  hl?: string;

  /**
   * @title Location
   * @description Location for search results (e.g., "SoHo, New York, United States")
   */
  location?: string;

  /**
   * @title Autocorrect
   * @description Whether to autocorrect spelling in query
   */
  autocorrect?: boolean;

  /**
   * @title Results Per Page
   * @description Number of results per page
   */
  num?: number;

  /**
   * @title Time Filter
   * @description Time-based search filter
   */
  tbs?: "qdr:h" | "qdr:d" | "qdr:w" | "qdr:m" | "qdr:y";

  /**
   * @title Page Number
   * @description Page number of results
   */
  page?: number;

  /**
   * @title Site Filter
   * @description Limit results to specific domain
   */
  site?: string;

  /**
   * @title File Type
   * @description Limit to specific file types (e.g., 'pdf', 'doc')
   */
  filetype?: string;

  /**
   * @title URL Contains
   * @description Search for pages with word in URL
   */
  inurl?: string;

  /**
   * @title Title Contains
   * @description Search for pages with word in title
   */
  intitle?: string;

  /**
   * @title Related Sites
   * @description Find similar websites
   */
  related?: string;

  /**
   * @title Cache
   * @description View Google's cached version
   */
  cache?: string;

  /**
   * @title Before Date
   * @description Date before in YYYY-MM-DD format
   */
  before?: string;

  /**
   * @title After Date
   * @description Date after in YYYY-MM-DD format
   */
  after?: string;

  /**
   * @title Exact Phrase
   * @description Exact phrase match
   */
  exact?: string;

  /**
   * @title Exclude Terms
   * @description Terms to exclude (comma-separated)
   */
  exclude?: string;

  /**
   * @title OR Terms
   * @description Alternative terms (OR operator) (comma-separated)
   */
  or?: string;
}

/**
 * @title Search with Serper
 * @description Perform a web search using Serper API
 */
export default async function search(
  props: ISearchParams,
  _req: Request,
  ctx: AppContext,
): Promise<ISearchResult> {
  const response = await ctx.searchApi["POST /search"]({}, {
    body: {
      ...props,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Serper API error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return await response.json();
}
