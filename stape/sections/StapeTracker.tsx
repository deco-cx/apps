import { AppContext } from "../mod.ts";
import { type SectionProps } from "@deco/deco";

export interface Props {
  /**
   * @title Enable Auto Page Tracking
   * @description Automatically track page views server-side
   * @default true
   */
  enableAutoPageTracking?: boolean;

  /**
   * @title Track E-commerce Events
   * @description Enable automatic e-commerce event tracking
   * @default true
   */
  enableEcommerceTracking?: boolean;

  /**
   * @title Custom Event Parameters
   * @description Additional custom parameters to include with all events
   */
  customParameters?: Record<string, string>;

  /**
   * @title Debug Mode
   * @description Enable debug mode for server-side tracking
   * @default false
   */
  debugMode?: boolean;

  /**
   * @title User Identifier
   * @description Custom user identifier for tracking
   */
  userId?: string;
}

/**
 * @title Stape Server-Side Tracker
 * @description Completely server-side tracking configuration. No client-side JavaScript is executed.
 */
export default function StapeServerTracker(
  props: SectionProps<typeof loader>,
) {
  const {
    containerUrl,
    gtmContainerId,
    enableGdprCompliance,
    enableAutoPageTracking,
    enableEcommerceTracking,
    debugMode,
    pageUrl,
    userAgent,
    clientIp,
  } = props;

  if (debugMode) {
    console.log("Stape Server Tracker Configuration:", {
      containerUrl,
      gtmContainerId,
      enableGdprCompliance,
      enableAutoPageTracking,
      enableEcommerceTracking,
      pageUrl,
      userAgent,
      clientIp,
    });
  }

  // Return a minimal hidden element for configuration tracking
  return (
    <div
      style={{
        display: "none",
        position: "absolute",
        top: "-9999px",
        left: "-9999px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      }}
      data-stape-tracker="server-side"
      data-container-url={containerUrl}
      data-gtm-id={gtmContainerId}
      data-gdpr-enabled={enableGdprCompliance?.toString()}
      data-auto-page-tracking={enableAutoPageTracking?.toString()}
      data-ecommerce-tracking={enableEcommerceTracking?.toString()}
      data-page-url={pageUrl}
      data-user-agent={userAgent}
      data-client-ip={clientIp}
      aria-hidden="true"
    />
  );
}

export const loader = async (props: Props, req: Request, ctx: AppContext) => {
  const {
    containerUrl,
    gtmContainerId,
    enableGdprCompliance = true,
    consentCookieName = "cookie_consent",
  } = ctx;

  // Extract request information for server-side tracking
  const pageUrl = req.url;
  const userAgent = req.headers.get("user-agent") || "";
  const clientIp = req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  // Automatically track page view if enabled
  if (props.enableAutoPageTracking !== false && containerUrl) {
    try {
      // Check GDPR consent from cookies if enabled
      let hasConsent = true;
      if (enableGdprCompliance) {
        const cookieHeader = req.headers.get("cookie") || "";
        const consentCookie = cookieHeader
          .split("; ")
          .find((row) => row.startsWith(`${consentCookieName}=`))
          ?.split("=")[1];

        hasConsent = consentCookie === "true" || consentCookie === "granted";
      }

      if (hasConsent) {
        // Generate stable client ID from existing cookies or create new one
        let clientId: string;

        // Get cookie header for client ID extraction
        const cookieHeader = req.headers.get("cookie") || "";

        // Try to extract from existing _ga cookie first
        const gaCookie = cookieHeader
          .split("; ")
          .find((row: string) => row.startsWith("_ga="))
          ?.split("=")[1];

        if (gaCookie) {
          // Extract client ID from GA cookie format: GA1.1.clientId.timestamp
          const gaParts = gaCookie.split(".");
          if (gaParts.length >= 3) {
            clientId = `${gaParts[2]}.${gaParts[3] || Date.now()}`;
          } else {
            clientId = crypto.randomUUID();
          }
        } else {
          // Try to find existing Stape client ID cookie
          const stapeClientCookie = cookieHeader
            .split("; ")
            .find((row: string) => row.startsWith("_stape_client_id="))
            ?.split("=")[1];

          if (stapeClientCookie) {
            clientId = stapeClientCookie;
          } else {
            // Generate new stable ID and it should be set as cookie client-side
            clientId = crypto.randomUUID();
          }
        }

        // Prepare page view event data
        const eventData = {
          events: [{
            name: "page_view",
            params: {
              page_location: pageUrl,
              page_title: "Server-Side Page View",
              page_referrer: req.headers.get("referer") || "",
              client_id: clientId,
              user_id: props.userId || undefined,
              timestamp_micros: Date.now() * 1000,
              ...props.customParameters,
            },
          }],
          gtm_container_id: gtmContainerId,
          client_id: clientId,
          user_id: props.userId || undefined,
          consent: {
            ad_storage: "granted",
            analytics_storage: "granted",
            ad_user_data: "granted",
            ad_personalization: "granted",
          },
        };

        // Send to Stape container
        const stapeUrl = new URL("/gtm", containerUrl);

        const response = await fetch(stapeUrl.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent || "Deco-Stape-Server/1.0",
            "X-Forwarded-For": clientIp,
          },
          body: JSON.stringify(eventData),
        });

        if (props.debugMode) {
          console.log(
            `Stape: Auto page view tracked - ${
              response.ok ? "Success" : "Failed"
            } (${response.status})`,
          );
        }
      } else if (props.debugMode) {
        console.log("Stape: Page view blocked due to GDPR consent");
      }
    } catch (error) {
      if (props.debugMode) {
        console.error("Stape: Failed to auto-track page view:", error);
      }
    }
  }

  return {
    ...props,
    containerUrl,
    gtmContainerId,
    enableGdprCompliance,
    consentCookieName,
    pageUrl,
    userAgent,
    clientIp,
  };
};
