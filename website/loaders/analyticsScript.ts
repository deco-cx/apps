import { fetchSafe, STALE } from "../../utils/fetch.ts";
import { AppContext } from "../mod.ts";

interface Props {
  url: string;
}

export const DEFAULT_ANALYTICS_SCRIPT_URL = "https://s.lilstts.com/deco.js";

/**
 * @title Analytics Script Loader
 * @description Fetches analytics script content from a remote URL
 */
export default async function AnalyticsScript(
  _: Props,
  _req: Request,
  _ctx: AppContext,
): Promise<Response> {
  const url = DEFAULT_ANALYTICS_SCRIPT_URL;

  try {
    // Fetch the script content using fetchSafe
    const original = await fetchSafe(url, STALE);
    const response = new Response(original.body, original);

    // Set proper content type for JavaScript
    response.headers.set("Content-Type", "text/javascript");

    return response;
  } catch (error) {
    console.error("Error fetching analytics script:", error);
    return new Response(`Failed to fetch analytics script: ${error}`, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
