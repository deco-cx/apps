import { Head } from "$fresh/runtime.ts";
import { useScriptAsDataURI } from "@deco/deco/hooks";
import { context } from "@deco/deco";
declare global {
  interface Window {
    dataLayer: unknown[];
  }
}
export const getGTMIdFromSrc = (src: string | undefined) => {
  const trackingId = src ? new URL(src).searchParams.get("id") : undefined;
  return trackingId;
};
interface TagManagerProps {
  trackingId: string;
  src?: string;
}
export function GoogleTagManager(props: TagManagerProps) {
  const _isOnPremises = !!props.src;
  const hasTrackingId = "trackingId" in props;
  const id = _isOnPremises ? props.src : props.trackingId;
  const hostname = _isOnPremises
    ? props.src
    : "https://www.googletagmanager.com";
  const src = new URL(
    `/gtm.js?id=${hasTrackingId ? props.trackingId : ""}`,
    hostname,
  );
  const noscript = new URL(
    `/ns.html?id=${hasTrackingId ? props.trackingId : ""}`,
    hostname,
  );
  return (
    <>
      <Head>
        <script
          id={`gtm-script-${id}`}
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s);j.async=true;j.src=i;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer', '${src.href}');`,
          }}
        />
      </Head>

      <noscript>
        <iframe
          src={noscript.href}
          height="0"
          width="0"
          style="display:none;visibility:hidden"
        >
        </iframe>
      </noscript>
    </>
  );
}
export function GTAG({ trackingId }: Pick<TagManagerProps, "trackingId">) {
  return (
    <Head>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", '${trackingId}');`,
        }}
      />
    </Head>
  );
}
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
   * @description custom url for serving google tag manager.
   */
  src?: string;
  /**
   * @description Disable forwarding events into dataLayer
   */
  disableAutomaticEventPush?: boolean;
}
export default function Analytics(
  { trackingIds, src, googleAnalyticsIds, disableAutomaticEventPush }: Props,
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
            <GoogleTagManager src={src} trackingId={trackingId.trim()} />
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

      {disableAutomaticEventPush !== true && (
        <script defer id="analytics-script" src={useScriptAsDataURI(snippet)} />
      )}
    </>
  );
}
