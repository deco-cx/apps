import { context } from "deco/live.ts";
import Script from "partytown/Script.tsx";
import GoogleTagScript from "partytown/integrations/GTAG.tsx";
import GoogleTagManager from "partytown/integrations/GTM.tsx";
import { scriptAsDataURI } from "../../utils/dataURI.ts";

/**
 * This function handles all ecommerce analytics events.
 * Add another ecommerce analytics modules here.
 */
const snippet = () => {
  globalThis.window.DECO.events.subscribe((event) => {
    globalThis.window.dataLayer = globalThis.window.dataLayer || [];
    if (
      !event ||
      !globalThis.window.dataLayer ||
      typeof globalThis.window.dataLayer.push !== "function"
    ) {
      return;
    }

    if (event.name === "deco") {
      globalThis.window.dataLayer.push({
        event: event.name,
        deco: event.params,
      });
      return;
    }

    globalThis.window.dataLayer.push({ ecommerce: null });
    globalThis.window.dataLayer.push({
      event: event.name,
      ecommerce: event.params,
    });
  });
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
   * @description prevent dataLayer being forward into partytown worker
   */
  preventForward?: boolean;

  /**
   * @description Disable forwarding events into dataLayer
   */
  disableAutomaticEventPush?: boolean;
}

export default function Analytics({
  trackingIds,
  src,
  dangerouslyRunOnMainThread,
  googleAnalyticsIds,
  preventForward,
  disableAutomaticEventPush,
}: Props) {
  const isDeploy = !!context.isDeploy;

  return (
    <>
      {/* TODO: Add debug from query string @author Igor Brasileiro */}
      {/* Add Tag Manager script during production only. To test it locally remove the condition */}
      {isDeploy &&
        trackingIds &&
        trackingIds.map((trackingId) => (
          <GoogleTagManager
            trackingId={trackingId.trim()}
            dangerouslyRunOnMainThread={dangerouslyRunOnMainThread}
            preventForward={preventForward}
          />
        ))}
      {isDeploy &&
        googleAnalyticsIds &&
        googleAnalyticsIds.map((trackingId) => (
          <GoogleTagScript
            trackingId={trackingId.trim()}
            dangerouslyRunOnMainThread={dangerouslyRunOnMainThread}
            preventForward={preventForward}
          />
        ))}
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
      {disableAutomaticEventPush !== true && (
        <script defer id="analytics-script" src={scriptAsDataURI(snippet)} />
      )}
    </>
  );
}
