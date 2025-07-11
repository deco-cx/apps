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
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Response> {
  const url = props.url || DEFAULT_ANALYTICS_SCRIPT_URL;

  if (ctx.disableProxy) {
    return new Response("Proxy disabled", { status: 403 });
  }

  try {
    // Fetch the script content using fetchSafe
    const original = await fetchSafe(url, STALE);
    const response = new Response(original.body, original);

    // Set proper content type for JavaScript
    response.headers.set("Content-Type", "text/javascript");

    return response;
  } catch (error) {
    console.error("Error fetching analytics script:", error);
    return new Response(`Failed to fetch analytics script: ${error.message}`, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
