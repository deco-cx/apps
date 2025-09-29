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

export default async function analyticsScript(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Response> {
  const { containerUrl, gtmContainerId } = ctx;

  try {
    // Use custom script URL or build from container URL + container/measurement ID
    let scriptUrl = props.customScriptUrl;
    if (!scriptUrl) {
      if (gtmContainerId?.startsWith("GTM-")) {
        scriptUrl = new URL(
          `/gtm.js?id=${encodeURIComponent(gtmContainerId)}`,
          containerUrl
        ).toString();
      } else if (gtmContainerId?.startsWith("G-")) {
        scriptUrl = new URL(
          `/gtag/js?id=${encodeURIComponent(gtmContainerId)}`,
          containerUrl
        ).toString();
      } else {
        // Fallback: try GTM without id (may be rejected by container)
        scriptUrl = new URL("/gtm.js", containerUrl).toString();
      }
    }

    // Optional: 5s timeout to avoid request-thread blocking
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 5000);

    const response = await fetch(scriptUrl, {
      headers: {
        "User-Agent":
          req.headers.get("user-agent") || "Deco-Stape-Integration/1.0",
      },
      signal: ac.signal,
    });
    clearTimeout(t);

    // …rest of your logic…
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
    const fallbackScript = `// Stape analytics script fallback
console.warn('Stape analytics script failed to load. Using fallback.');
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