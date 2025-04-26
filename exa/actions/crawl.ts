import { AppContext } from "../mod.ts";
import { ExaSearchResult } from "../client.ts";

export interface Props {
  /**
   * @title Document IDs
   * @description IDs of the documents to crawl
   */
  ids: string[];

  /**
   * @title Include Text
   * @description Whether to include document text in results
   * @default true
   */
  text?: boolean;

  /**
   * @title Live Crawl
   * @description Whether to use live crawling
   * @default "always"
   */
  livecrawl?: "always" | "fallback";
}

/**
 * @title Crawl
 * @description Retrieve specific documents from Exa AI
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ results: ExaSearchResult[] }> => {
  const {
    ids,
    text = true,
    livecrawl = "always",
  } = props;

  try {
    const response = await ctx.api["POST /crawl"](
      {},
      {
        body: {
          ids,
          text,
          livecrawl,
        },
      },
    );

    const result = await response.json();

    // Check if the result contains expected data
    if (!result || !result.results || !Array.isArray(result.results)) {
      throw new Error(
        "Invalid or empty response from Exa API for document crawling",
      );
    }

    return result;
  } catch (error) {
    console.error("Exa crawl error:", error);

    // Error is propagated to caller
    throw error;
  }
};

export default action;
