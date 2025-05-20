import { AppContext } from "../mod.ts";
import { ExaSearchResponse } from "../client.ts";

export interface Props {
  /**
   * @title Company URL
   * @description Company website URL (e.g., 'exa.ai' or 'https://exa.ai')
   */
  query: string;

  /**
   * @title Number of Subpages
   * @description Number of subpages to crawl
   * @default 10
   */
  subpages?: number;

  /**
   * @title Target Sections
   * @description Specific sections to target (e.g., 'about', 'pricing', 'faq', 'blog')
   */
  subpageTarget?: string[];

  /**
   * @title Max Characters
   * @description Maximum number of characters to return in text results
   * @default 3000
   */
  maxCharacters?: number;
}

/**
 * @title Company Research
 * @description Research companies using Exa AI by crawling their websites
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ExaSearchResponse> => {
  const {
    query,
    subpages = 10,
    subpageTarget,
    maxCharacters = 3000,
  } = props;

  try {
    // Extract domain from query if it's a URL
    let domain = query;
    if (query.includes("http")) {
      try {
        const url = new URL(query);
        domain = url.hostname.replace("www.", "");
      } catch (_e) {
        console.warn(`Could not parse URL from query: ${query}`);
      }
    }

    const response = await ctx.api["POST /search"](
      {},
      {
        body: {
          query,
          category: "company",
          includeDomains: [domain],
          type: "auto",
          numResults: 1,
          contents: {
            text: {
              maxCharacters,
            },
            livecrawl: "always",
            subpages,
            subpageTarget,
          },
        },
      },
    );

    const result = await response.json();

    // Check if the result contains expected data
    if (!result || !result.results || !Array.isArray(result.results)) {
      throw new Error(
        "Invalid or empty response from Exa API for company research",
      );
    }

    return result;
  } catch (error) {
    console.error("Exa company research error:", error);

    // Error is propagated to caller
    throw error;
  }
};

export default loader;
