import { AppContext } from "../mod.ts";
import { ExaSearchResponse } from "../client.ts";

export interface Props {
  /**
   * @title Search Query
   * @description The search query to send to Exa
   */
  query: string;

  /**
   * @title Number of Results
   * @description Number of search results to return
   * @default 5
   */
  numResults?: number;

  /**
   * @title Search Type
   * @description Type of search to perform
   * @default "auto"
   */
  type?: "auto" | "keyword" | "neural";

  /**
   * @title Include Domains
   * @description List of domains to include in search results
   */
  includeDomains?: string[];

  /**
   * @title Exclude Domains
   * @description List of domains to exclude from search results
   */
  excludeDomains?: string[];

  /**
   * @title Max Characters
   * @description Maximum number of characters to return in text results
   * @default 3000
   */
  maxCharacters?: number;

  /**
   * @title Live Crawl
   * @description Whether to use live crawling
   * @default "always"
   */
  livecrawl?: "always" | "fallback";
}

/**
 * @title Search
 * @description Search the web using Exa AI
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ExaSearchResponse> => {
  const {
    query,
    numResults = 5,
    type = "auto",
    includeDomains,
    excludeDomains,
    maxCharacters = 3000,
    livecrawl = "always",
  } = props;

  try {
    const response = await ctx.api["POST /search"](
      {},
      {
        body: {
          query,
          type,
          numResults,
          includeDomains,
          excludeDomains,
          contents: {
            text: {
              maxCharacters,
            },
            livecrawl,
          },
        },
      },
    );

    const result = await response.json();

    // Check if the result contains expected data
    if (!result || !result.results || !Array.isArray(result.results)) {
      throw new Error("Invalid or empty response from Exa API");
    }

    return result;
  } catch (error) {
    console.error("Exa search error:", error);

    // Error is propagated to caller
    throw error;
  }
};

export default loader;
