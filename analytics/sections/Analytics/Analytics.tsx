import { context } from "deco/live.ts";
import Script from "partytown/Script.tsx";
import { AnalyticsEvent } from "../../../commerce/types.ts";

declare global {
  interface Window {
    deco: {
      analytics: Array<
        // deno-lint-ignore no-explicit-any
        (action: string, eventType: string, props?: any) => void
      >;
    };
  }
}

/**
 * This function handles all ecommerce analytics events.
 * Add another ecommerce analytics modules here.
 */
const sendAnalyticsEvent = <T extends AnalyticsEvent>(
  event: T,
) => {
  window.dataLayer && window.dataLayer.push({ ecommerce: null });
  window.dataLayer && window.dataLayer.push({
    event: event.name,
    ecommerce: event.params,
  });

  window.deco?.analytics &&
    window.deco?.analytics.map((f) => f("track", "ecommerce", event));
};

export default function Analtyics() {
  const isDeploy = !!context.isDeploy;
  return (
    <>
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
          __html:
            `window.DECO_SITES_STD = { sendAnalyticsEvent: ${sendAnalyticsEvent.toString()} }`,
        }}
      />
    </>
  );
}
