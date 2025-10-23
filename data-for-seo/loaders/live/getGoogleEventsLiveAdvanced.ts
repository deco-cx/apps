import type { AppContext } from "../../mod.ts";
import type { EventResult } from "../../client.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

export interface Props {
  /**
   * @title Search Keyword
   * @description The keyword to search for events (e.g., "concerts", "conferences")
   */
  keyword: string;

  /**
   * @title Location Name
   * @description Location for event search (e.g., "Los Angeles,California,United States")
   */
  locationName?: string;

  /**
   * @title Location Coordinate
   * @description GPS coordinates for location-based search (e.g., "34.0522,-118.2437")
   */
  locationCoordinate?: string;

  /**
   * @title Language Code
   * @description Two-letter language code (e.g., "en", "pt")
   * @default "en"
   */
  languageCode?: string;

  /**
   * @title Date Range
   * @description Filter events by date (e.g., "today", "tomorrow", "this_week", "next_week", "this_month", "next_month")
   * @default "today"
   */
  dateRange?: string;

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
   * @title Load SERP Features
   * @description Include additional SERP features in results
   * @default false
   */
  loadSerpFeatures?: boolean;
}

export interface GoogleEventsResult {
  keyword: string;
  type: string;
  se_domain: string;
  location_code?: number;
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
  items: EventResult[];
}

/**
 * @title Get Google Events - Live Advanced
 * @description Search Google Events in real-time with advanced parameters
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const {
    keyword,
    locationName,
    locationCoordinate,
    languageCode = "en",
    dateRange = "today",
    os = "windows",
    depth = 10,
    loadSerpFeatures = false,
  } = props;

  if (!keyword) {
    throw new Error("Keyword is required");
  }

  try {
    const requestBody: Parameters<
      typeof ctx.client["POST /serp/google/events/live/advanced"]
    >[1]["body"][0] = {
      keyword,
      language_code: languageCode,
      date_range: dateRange,
      os,
      depth,
      load_serp_features: loadSerpFeatures,
      ...(locationName && { location_name: locationName }),
      ...(locationCoordinate && !locationName &&
        { location_coordinate: locationCoordinate }),
    };

    const body = [requestBody];

    const response = await ctx.client["POST /serp/google/events/live/advanced"](
      {},
      { body },
    );

    const result = await handleDataForSeoResponse(
      response,
      "Google Events Live",
    );

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
      throw new Error("Google Events search completed but returned no results");
    }

    // Live endpoints sempre retornam apenas um resultado
    return task.result[0] as GoogleEventsResult;
  } catch (error) {
    throw new Error(
      `Failed to get Google Events results: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
