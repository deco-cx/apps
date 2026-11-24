import { AnalyticsEvent } from "../../../commerce/types.ts";
import {
  getGTMIdFromSrc,
  GoogleTagManager,
  GTAG,
} from "../../../website/components/Analytics.tsx";
import { context } from "@deco/deco";
import { isRenderedFromRequestProps } from "../../../website/utils/renderFromRequest.ts";
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
// Tag ids and the GTM host decide which third-party code runs on the page, so
// never take them from request props (see isRenderedFromRequestProps).
export const loader = (props: Props, req: Request): Props =>
  isRenderedFromRequestProps(req)
    ? {
      ...props,
      src: undefined,
      trackingIds: undefined,
      googleAnalyticsIds: undefined,
    }
    : props;

export default function Analtyics(
  { src, trackingIds, googleAnalyticsIds }: Props,
) {
  const isDeploy = !!context.isDeploy;
  // Prevent breacking change. Drop this in next major to only have
  // src: https://hostname
  // trackingId: GTM-ID
  const trackingId = getGTMIdFromSrc(src) ?? "";
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
          {/*  Drop this in next major to only have trackingId or trackingId and src */}
          {src && !trackingIds?.length && (
            <GoogleTagManager src={src} trackingId={trackingId} />
          )}
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
