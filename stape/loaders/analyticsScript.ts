import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Custom Script URL
   * @description Optional custom script URL to override default
   */
  customScriptUrl?: string;
}

/**
 * @title Stape Analytics Script
 * @description Loads the Stape analytics tracking script
 */
export default async function analyticsScript(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Response> {
  const { containerUrl } = ctx;
  
  if (!containerUrl) {
    return new Response(
      "// Stape container URL not configured",
      {
        status: 200,
        headers: {
          "Content-Type": "text/javascript",
          "Cache-Control": "public, max-age=300",
        },
      }
    );
  }

  try {
    // Use custom script URL or build from container URL
    const scriptUrl = props.customScriptUrl || new URL("/gtag/js", containerUrl).toString();

    // Fetch the script from Stape
    const response = await fetch(scriptUrl, {
      headers: {
        "User-Agent": req.headers.get("user-agent") || "Deco-Stape-Integration/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch script: ${response.status}`);
    }

    const scriptContent = await response.text();

    return new Response(scriptContent, {
      status: 200,
      headers: {
        "Content-Type": "text/javascript",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error loading Stape analytics script:", error);
    
    // Return a minimal fallback script
    const fallbackScript = `
// Stape analytics script fallback
console.warn('Stape analytics script failed to load: ${error}');
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
`;

    return new Response(fallbackScript, {
      status: 200,
      headers: {
        "Content-Type": "text/javascript",
        "Cache-Control": "no-cache",
      },
    });
  }
}