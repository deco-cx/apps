import { context } from "deco/live.ts";
import { AnalyticsEvent } from "../../../commerce/types.ts";
import {
  GoogleTagManager,
  GTAG,
} from "../../../website/components/Analytics.tsx";

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
const sendAnalyticsEvent = <T extends AnalyticsEvent>(event: T) => {
  globalThis.window.dataLayer &&
    globalThis.window.dataLayer.push({ ecommerce: null });
  globalThis.window.dataLayer &&
    globalThis.window.dataLayer.push({
      event: event.name,
      ecommerce: event.params,
    });

  globalThis.window.DECO_ANALYTICS &&
    Object.values(globalThis.window.DECO_ANALYTICS).map((f) =>
      f("track", "ecommerce", event)
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
}

export default function Analtyics({
  src,
  trackingIds,
  googleAnalyticsIds,
}: Props) {
  const isDeploy = !!context.isDeploy;
  return (
    <>
      {/* Add Tag Manager script during production only. To test it locally remove the condition */}
      {isDeploy && (
        <>
          {trackingIds?.map((trackingId) => (
            <GoogleTagManager trackingId={trackingId.trim()} />
          ))}
          {googleAnalyticsIds?.map((trackingId) => (
            <GTAG trackingId={trackingId.trim()} />
          ))}
          {src && <GoogleTagManager src={src} />}
        </>
      )}

      <script
        type="module"
        id="analytics-script"
        dangerouslySetInnerHTML={{
          __html:
            `window.DECO_SITES_STD = { sendAnalyticsEvent: ${sendAnalyticsEvent.toString()} }`,
        }}
      />
    </>
  );
}
