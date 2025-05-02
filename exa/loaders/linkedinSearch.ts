import { AppContext } from "../mod.ts";
import { ExaSearchResponse } from "../client.ts";

export interface Props {
  /**
   * @title Search Query
   * @description Search query for LinkedIn (e.g., <url> company page OR <company name> company page)
   */
  query: string;

  /**
   * @title Number of Results
   * @description Number of search results to return
   * @default 5
   */
  numResults?: number;

  /**
   * @title Max Characters
   * @description Maximum number of characters to return in text results
   * @default 3000
   */
  maxCharacters?: number;
}

/**
 * @title LinkedIn Search
 * @description Search LinkedIn for companies using Exa AI
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ExaSearchResponse> => {
  const {
    query,
    numResults = 5,
    maxCharacters = 3000,
  } = props;

  try {
    const response = await ctx.api["POST /search"](
      {},
      {
        body: {
          query,
          type: "auto",
          includeDomains: ["linkedin.com"],
          numResults,
          contents: {
            text: {
              maxCharacters,
            },
            livecrawl: "always",
          },
        },
      },
    );

    const result = await response.json();

    // Check if the result contains expected data
    if (!result || !result.results || !Array.isArray(result.results)) {
      throw new Error(
        "Invalid or empty response from Exa API for LinkedIn search",
      );
    }

    return result;
  } catch (error) {
    console.error("Exa LinkedIn search error:", error);

    // Error is propagated to caller
    throw error;
  }
};

export default loader;
