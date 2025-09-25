import type { AppContext } from "../../mod.ts";
import type { NewsResult } from "../../client.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

export interface Props {
  /**
   * @title Search Keyword
   * @description The keyword to search for in Google News
   */
  keyword: string;

  /**
   * @title Language Code
   * @description Two-letter language code (e.g., "en", "pt")
   * @default "en"
   */
  languageCode?: string;

  /**
   * @title Location Code
   * @description Location code from DataForSEO locations list
   * @default 2840
   */
  locationCode?: number;

  /**
   * @title Device Type
   * @description Device type for search results
   * @default "desktop"
   */
  device?: "desktop" | "mobile";

  /**
   * @title Operating System
   * @description Operating system for search results
   * @default "windows"
   */
  os?: "windows" | "macos";

  /**
   * @title Results Depth
   * @description Number of results to return (max 700)
   * @default 10
   */
  depth?: number;

  /**
   * @title Sort By
   * @description Sort results by relevance or date
   * @default "relevance"
   */
  sortBy?: "relevance" | "date";

  /**
   * @title Time Range
   * @description Filter results by time range
   * @default "all"
   */
  timeRange?: "all" | "1h" | "1d" | "1w" | "1m" | "1y";

  /**
   * @title Load SERP Features
   * @description Include additional SERP features in results
   * @default false
   */
  loadSerpFeatures?: boolean;
}

export interface GoogleNewsResult {
  keyword: string;
  type: string;
  se_domain: string;
  location_code: number;
  language_code: string;
  check_url: string;
  datetime: string;
  spell?: {
    query: string;
    type: string;
  };
  item_types: string[];
  se_results_count: number;
  items_count: number;
  items: NewsResult[];
}

/**
 * @title Get Google News - Live Advanced
 * @description Search Google News in real-time with advanced parameters
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const {
    keyword,
    languageCode = "en",
    locationCode = 2840,
    device = "desktop",
    os = "windows",
    depth = 10,
    sortBy = "relevance",
    timeRange = "all",
    loadSerpFeatures = false,
  } = props;

  if (!keyword) {
    throw new Error("Keyword is required");
  }

  try {
    const body = [{
      keyword,
      language_code: languageCode,
      location_code: locationCode,
      device,
      os,
      depth,
      sort_by: sortBy,
      time_range: timeRange,
      load_serp_features: loadSerpFeatures,
    }];

    const response = await ctx.client["POST /serp/google/news/live/advanced"](
      {},
      { body },
    );

    const result = await handleDataForSeoResponse(response, "Google News Live");

    // Validação robusta da estrutura de resposta
    if (
      !result.tasks || !Array.isArray(result.tasks) || result.tasks.length === 0
    ) {
      throw new Error("Invalid response structure: no tasks found");
    }

    const task = result.tasks[0];

    if (
      !task.result || !Array.isArray(task.result) || task.result.length === 0
    ) {
      throw new Error("Google News search completed but returned no results");
    }

    // Live endpoints sempre retornam apenas um resultado
    return task.result[0] as GoogleNewsResult;
  } catch (error) {
    throw new Error(
      `Failed to get Google News results: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
