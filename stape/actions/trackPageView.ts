import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Page URL
   * @description URL of the page being tracked
   */
  pageUrl?: string;

  /**
   * @title Page Title
   * @description Title of the page being tracked
   */
  pageTitle?: string;

  /**
   * @title Page Referrer
   * @description Referrer URL if available
   */
  pageReferrer?: string;

  /**
   * @title Additional Parameters
   * @description Additional custom parameters for the page view
   */
  additionalParams?: Record<string, unknown>;

  /**
   * @title Client ID
   * @description Client identifier for tracking continuity
   */
  clientId?: string;

  /**
   * @title User ID
   * @description User identifier for cross-device tracking
   */
  userId?: string;
}

/**
 * @title Track Page View (Server-Side)
 * @description Tracks page views server-side to Stape container, ensuring no client-side JavaScript is needed
 */
const trackPageView = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; eventId?: string; error?: string }> => {
  const { containerUrl, gtmContainerId, enableGdprCompliance } = ctx;

  if (!containerUrl) {
    return {
      success: false,
      error: "Stape container URL not configured",
    };
  }

  try {
    // Get page information from request or props
    const pageUrl = props.pageUrl || req.url;
    const pageTitle = props.pageTitle || "Page View";
    const pageReferrer = props.pageReferrer || req.headers.get("referer") || "";
    
    // Generate event ID
    const eventId = crypto.randomUUID();

    // Generate or use client ID
    const clientId = props.clientId || crypto.randomUUID();

    // Check GDPR consent from cookies if enabled
    let hasConsent = true;
    if (enableGdprCompliance) {
      const cookieHeader = req.headers.get("cookie") || "";
      const consentCookie = cookieHeader
        .split("; ")
        .find(row => row.startsWith("cookie_consent="))
        ?.split("=")[1];
      
      hasConsent = consentCookie === "true" || consentCookie === "granted";
    }

    if (!hasConsent) {
      return {
        success: false,
        error: "Event blocked due to GDPR consent",
      };
    }

    // Prepare event data in GA4 format
    const eventData = {
      events: [{
        name: "page_view",
        params: {
          page_location: pageUrl,
          page_title: pageTitle,
          page_referrer: pageReferrer,
          client_id: clientId,
          user_id: props.userId || undefined,
          timestamp_micros: Date.now() * 1000,
          ...props.additionalParams,
        },
      }],
      gtm_container_id: gtmContainerId,
      client_id: clientId,
      user_id: props.userId || undefined,
      consent: {
        ad_storage: hasConsent ? "granted" : "denied",
        analytics_storage: hasConsent ? "granted" : "denied",
        ad_user_data: hasConsent ? "granted" : "denied",
        ad_personalization: hasConsent ? "granted" : "denied",
      },
    };

    // Send to Stape container
    const stapeUrl = new URL("/gtm", containerUrl);
    
    const response = await fetch(stapeUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": req.headers.get("user-agent") || "Deco-Stape-Server/1.0",
        "X-Forwarded-For": req.headers.get("x-forwarded-for") || 
                          req.headers.get("x-real-ip") || 
                          "127.0.0.1",
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`Stape API error: ${response.status} ${response.statusText}`);
    }

    console.log(`Stape: Page view tracked successfully for ${pageUrl}`);

    return {
      success: true,
      eventId,
    };

  } catch (error) {
    console.error("Failed to track page view to Stape:", error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export default trackPageView;