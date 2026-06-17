import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Custom Script URL
   * @description Optional custom script URL to override default
   */
  customScriptUrl?: string;

  /**
   * @title Script Type
   * @description Type of analytics script to load
   * @default gtm
   */
  scriptType?: "gtm" | "gtag" | "custom";

  /**
   * @title Cache Duration (seconds)
   * @description How long to cache the script response
   * @default 3600
   */
  cacheDuration?: number;

  /**
   * @title Timeout (ms)
   * @description Request timeout in milliseconds
   * @default 5000
   */
  timeoutMs?: number;

  /**
   * @title Enable Fallback
   * @description Enable fallback script if main script fails
   * @default true
   */
  enableFallback?: boolean;
}

// Helper function to determine script URL based on container and type
function buildScriptUrl(
  containerUrl: string,
  gtmContainerId?: string,
  scriptType: string = "gtm",
  customUrl?: string,
): string {
  if (customUrl) {
    return customUrl;
  }

  const baseUrl = new URL(containerUrl);

  switch (scriptType) {
    case "gtag":
      if (gtmContainerId?.startsWith("G-")) {
        return new URL(
          `/gtag/js?id=${encodeURIComponent(gtmContainerId)}`,
          baseUrl,
        ).toString();
      }
      return new URL("/gtag/js", baseUrl).toString();

    case "gtm":
    default:
      if (gtmContainerId?.startsWith("GTM-")) {
        return new URL(
          `/gtm.js?id=${encodeURIComponent(gtmContainerId)}`,
          baseUrl,
        ).toString();
      }
      return new URL("/gtm.js", baseUrl).toString();
  }
}

// Helper function to create fallback script
function createFallbackScript(scriptType: string = "gtm"): string {
  const timestamp = new Date().toISOString();

  if (scriptType === "gtag") {
    return `// Stape Gtag Fallback Script - Generated: ${timestamp}
console.warn('Stape gtag script failed to load. Using minimal fallback.');

// Initialize dataLayer
window.dataLayer = window.dataLayer || [];

// Gtag function
function gtag() {
  dataLayer.push(arguments);
}

// Initialize with current timestamp
gtag('js', new Date());

// Basic configuration
gtag('config', 'GA_MEASUREMENT_ID', {
  page_title: document.title,
  page_location: window.location.href
});

console.info('Stape gtag fallback loaded successfully');
`;
  }

  // Default GTM fallback
  return `// Stape GTM Fallback Script - Generated: ${timestamp}
console.warn('Stape GTM script failed to load. Using minimal fallback.');

// Initialize dataLayer
window.dataLayer = window.dataLayer || [];

// Push basic page view event
dataLayer.push({
  'event': 'gtm.js',
  'gtm.start': new Date().getTime(),
  'gtm.uniqueEventId': Math.random().toString(36).substr(2, 9)
});

// Push page view
dataLayer.push({
  'event': 'page_view',
  'page_title': document.title,
  'page_location': window.location.href,
  'page_referrer': document.referrer
});

console.info('Stape GTM fallback loaded successfully');
`;
}

// Helper function to create error response
function createErrorResponse(
  message: string,
  enableFallback: boolean,
  scriptType: string,
): Response {
  if (enableFallback) {
    const fallbackScript = createFallbackScript(scriptType);
    return new Response(fallbackScript, {
      status: 200,
      headers: {
        "Content-Type": "text/javascript",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Stape-Fallback": "true",
        "X-Stape-Error": message,
      },
    });
  }

  return new Response(
    `// Stape Error: ${message}\nconsole.error('Stape script loading failed: ${message}');`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/javascript",
        "Cache-Control": "no-cache",
        "X-Stape-Error": message,
      },
    },
  );
}

/**
 * @title Stape Analytics Script Loader
 * @description Intelligently loads Stape analytics scripts with fallback support and caching
 */
export default async function analyticsScript(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Response> {
  const { containerUrl, gtmContainerId } = ctx;
  const {
    customScriptUrl,
    scriptType = "gtm",
    cacheDuration = 3600,
    timeoutMs = 5000,
    enableFallback = true,
  } = props;

  // Validate container URL
  if (!containerUrl) {
    return createErrorResponse(
      "Container URL not configured",
      enableFallback,
      scriptType,
    );
  }

  try {
    // Build script URL based on configuration
    const scriptUrl = buildScriptUrl(
      containerUrl,
      gtmContainerId,
      scriptType,
      customScriptUrl,
    );

    console.log(
      `Loading Stape ${scriptType.toUpperCase()} script from: ${scriptUrl}`,
    );

    // Setup request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Enhanced headers for better compatibility
    const requestHeaders = {
      "User-Agent": req.headers.get("user-agent") ||
        "Deco-Stape-Integration/1.0",
      "Accept": "application/javascript, text/javascript, */*",
      "Accept-Language": req.headers.get("accept-language") || "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    };

    const response = await fetch(scriptUrl, {
      method: "GET",
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check response status
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Get script content
    const scriptContent = await response.text();

    // Validate script content (basic check)
    if (!scriptContent || scriptContent.trim().length === 0) {
      throw new Error("Empty script response");
    }

    // Check for common error patterns in response
    if (scriptContent.includes("404") || scriptContent.includes("Not Found")) {
      throw new Error("Script not found (404)");
    }

    console.log(
      `Stape ${scriptType.toUpperCase()} script loaded successfully (${scriptContent.length} bytes)`,
    );

    // Return successful response with appropriate caching
    return new Response(scriptContent, {
      status: 200,
      headers: {
        "Content-Type": "text/javascript; charset=utf-8",
        "Cache-Control":
          `public, max-age=${cacheDuration}, s-maxage=${cacheDuration}`,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "X-Stape-Script-Type": scriptType,
        "X-Stape-Container": new URL(containerUrl).hostname,
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error";

    // Log detailed error for debugging
    console.error(`Error loading Stape ${scriptType.toUpperCase()} script:`, {
      error: errorMessage,
      containerUrl,
      gtmContainerId,
      scriptType,
      customScriptUrl,
      userAgent: req.headers.get("user-agent"),
      timestamp: new Date().toISOString(),
    });

    // Return appropriate error response with fallback if enabled
    return createErrorResponse(errorMessage, enableFallback, scriptType);
  }
}
