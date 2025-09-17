import { AppContext } from "../../mod.ts";
import { handleDataForSeoResponse } from "../../utils/handleResponse.ts";

interface Props {
  /**
   * @title Keyword
   * @description The keyword to search
   */
  keyword: string;

  /**
   * @title Location Code
   * @description Location code (e.g., 2076 for Brazil, 2840 for United States)
   */
  location_code?: number;

  /**
   * @title Language Code
   * @description Language code (e.g., "pt" for Portuguese, "en" for English)
   */
  language_code?: string;

  /**
   * @title Device
   * @description Device type for search results
   */
  device?: "desktop" | "mobile";

  /**
   * @title OS
   * @description Operating system
   */
  os?: "windows" | "macos";

  /**
   * @title Depth
   * @description Number of results to return (max 700)
   */
  depth?: number;

  /**
   * @title Load Serp Features
   * @description Include SERP features in response
   */
  load_serp_features?: boolean;
}

/**
 * @name SERP_GOOGLE_ORGANIC_LIVE_ADVANCED
 * @title Get Organic SERP Live Advanced (Instant)
 * @description Get real-time organic search results from Google. ⚡ INSTANT RESPONSE - No task creation needed!
 * @workflow Direct call - returns data immediately without creating tasks
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const response = await ctx.client["POST /serp/google/organic/live/advanced"](
    {},
    {
      body: [{
        keyword: props.keyword,
        location_code: props.location_code || 2076, // Default Brazil
        language_code: props.language_code || "pt",
        device: props.device || "desktop",
        os: props.os || "windows",
        depth: props.depth || 100,
        load_serp_features: props.load_serp_features !== false,
      }],
    },
  );
  return await handleDataForSeoResponse(response, "Organic SERP Live Advanced");
}
