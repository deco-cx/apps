import type { AppContext } from "../../mod.ts";
import type { DatasetResult } from "../../client.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

export interface Props {
  /**
   * @title Search Keyword
   * @description The keyword to search for datasets (e.g., "water quality", "climate data")
   */
  keyword: string;

  /**
   * @title Last Updated
   * @description Filter by when dataset was last updated (e.g., "1m", "3m", "6m", "1y", "2y", "3y")
   */
  lastUpdated?: string;

  /**
   * @title File Formats
   * @description Filter by file formats (e.g., ["csv", "json", "xml", "archive", "image"])
   */
  fileFormats?: string[];

  /**
   * @title Usage Rights
   * @description Filter by usage rights (e.g., "commercial", "noncommercial")
   */
  usageRights?: string;

  /**
   * @title Is Free
   * @description Filter for free datasets only
   * @default true
   */
  isFree?: boolean;

  /**
   * @title Topics
   * @description Filter by dataset topics (e.g., ["natural_sciences", "geo", "social_sciences"])
   */
  topics?: string[];

  /**
   * @title Language Code
   * @description Two-letter language code (e.g., "en", "pt")
   * @default "en"
   */
  languageCode?: string;

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

export interface GoogleDatasetSearchResult {
  keyword: string;
  type: string;
  se_domain: string;
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
  items: DatasetResult[];
}

/**
 * @title Get Google Dataset Search - Live Advanced
 * @description Search Google Dataset Search in real-time with advanced filters
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const {
    keyword,
    lastUpdated,
    fileFormats,
    usageRights,
    isFree = true,
    topics,
    languageCode = "en",
    depth = 10,
    loadSerpFeatures = false,
  } = props;

  if (!keyword) {
    throw new Error("Keyword is required");
  }

  try {
    const requestBody: Parameters<
      typeof ctx.client["POST /serp/google/dataset_search/live/advanced"]
    >[1]["body"][0] = {
      keyword,
      language_code: languageCode,
      depth,
      load_serp_features: loadSerpFeatures,
      ...(lastUpdated && { last_updated: lastUpdated }),
      ...(fileFormats && fileFormats.length > 0 &&
        { file_formats: fileFormats }),
      ...(usageRights && { usage_rights: usageRights }),
      ...(typeof isFree === "boolean" && { is_free: isFree }),
      ...(topics && topics.length > 0 && { topics }),
    };

    const body = [requestBody];

    const response = await ctx.client
      ["POST /serp/google/dataset_search/live/advanced"]({}, { body });

    const result = await handleDataForSeoResponse(
      response,
      "Google Dataset Search Live",
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
      throw new Error(
        "Google Dataset Search completed but returned no results",
      );
    }

    // Live endpoints sempre retornam apenas um resultado
    return task.result[0] as GoogleDatasetSearchResult;
  } catch (error) {
    throw new Error(
      `Failed to get Google Dataset Search results: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
