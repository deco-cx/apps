import { context } from "deco/live.ts";
import GoogleTagManager from "partytown/integrations/GTM.tsx";
import GoogleTagScript from "partytown/integrations/GTAG.tsx";
import Script from "partytown/Script.tsx";

declare global {
  interface Window {
    DECO_ANALYTICS: Record<
      string,
      // deno-lint-ignore no-explicit-any
      (action: string, eventType: string, props?: any) => void
    >;
  }
}

/**
 * This function handles all ecommerce analytics events.
 * Add another ecommerce analytics modules here.
 */
const sendAnalyticsEvent = (
  // deno-lint-ignore no-explicit-any
  event: any,
) => {
  window.dataLayer && window.dataLayer.push({ ecommerce: null });
  window.dataLayer && window.dataLayer.push({
    event: event.name,
    ecommerce: event.params,
  });

  window.DECO_ANALYTICS &&
    Object.values(window.DECO_ANALYTICS).map((f) =>
      f("track", "analyticsType", event)
    );
};

export interface Props {
  /**
   * @description google tag manager container id. For more info: https://developers.google.com/tag-platform/tag-manager/web#standard_web_page_installation .
   */
  trackingIds?: string[];
  /**
   * @title GA Measurement Ids
   * @label measurement id
   * @description the google analytics property measurement id. For more info: https://support.google.com/analytics/answer/9539598
   */
  googleAnalyticsIds?: string[];
  /**
   * @description custom url for serving google tag manager. Set either this url or the tracking id
   */
  src?: string;
  /**
   * @description run GTM directly on the main thread, without Partytown. This is useful for debugging purposes. Default: false
   */
  dangerouslyRunOnMainThread?: boolean;

  /**
   * @description define the name of event type sent to datalayer and registered analytics. Default: ecommerce
   */
  analyticsType?: string;

  /**
   * @description prevent dataLayer being forward
   */
  preventForward?: boolean;
}

export default function Analtyics(
  {
    trackingIds,
    src,
    dangerouslyRunOnMainThread,
    googleAnalyticsIds,
    analyticsType,
    preventForward,
  }: Props,
) {
  const isDeploy = !!context.isDeploy;
  const eventType = analyticsType ?? "ecommerce";

  return (
    <>
      {/* TODO: Add debug from query string @author Igor Brasileiro */}
      {/* Add Tag Manager script during production only. To test it locally remove the condition */}
      {isDeploy && trackingIds && (
        trackingIds.map((trackingId) => (
          <GoogleTagManager
            trackingId={trackingId.trim()}
            dangerouslyRunOnMainThread={dangerouslyRunOnMainThread}
            preventForward={preventForward}
          />
        ))
      )}
      {isDeploy && googleAnalyticsIds && (
        googleAnalyticsIds.map((trackingId) => (
          <GoogleTagScript
            trackingId={trackingId.trim()}
            dangerouslyRunOnMainThread={dangerouslyRunOnMainThread}
            preventForward={preventForward}
          />
        ))
      )}
      {isDeploy && src && (
        <GoogleTagManager
          src={src}
          dangerouslyRunOnMainThread={dangerouslyRunOnMainThread}
          preventForward={preventForward}
        />
      )}

      <Script
        dangerouslySetInnerHTML={{
          // add all globals variables here
          __html:
            `debugGlobals = () => { console.table([["datalayer", dataLayer]]); }`,
        }}
        forward={["debugGlobals"]}
      />
      <script
        type="module"
        id="analytics-script"
        dangerouslySetInnerHTML={{
          __html: `window.DECO_SITES_STD = { sendAnalyticsEvent: ${
            sendAnalyticsEvent.toString().replace("analyticsType", eventType)
          } }`,
        }}
      />
    </>
  );
}
