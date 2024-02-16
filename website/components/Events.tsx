import { Head } from "$fresh/runtime.ts";
import { DECO_SEGMENT } from "deco/runtime/fresh/middlewares/3_main.ts";
import { type AnalyticsEvent, type Deco } from "../../commerce/types.ts";
import { scriptAsDataURI } from "../../utils/dataURI.ts";
import { Flag } from "deco/types.ts";

type EventHandler = (event?: AnalyticsEvent) => void | Promise<void>;

interface EventsAPI {
  dispatch: (event: unknown) => void;
  subscribe: (
    handler: EventHandler,
    options?: AddEventListenerOptions | boolean,
  ) => () => void;
}

declare global {
  interface Window {
    DECO_ANALYTICS: Record<
      string,
      // deno-lint-ignore no-explicit-any
      (action: string, eventType: string, props?: any) => void
    >;
    DECO_SITES_STD: { sendAnalyticsEvent: (event: unknown) => void };
    DECO: { events: EventsAPI };
  }
}

/**
 * This function handles all ecommerce analytics events.
 * Add another ecommerce analytics modules here.
 */
const snippet = (
  { deco: { page }, segmentCookie }: { deco: Deco; segmentCookie: string },
) => {
  const cookie = document.cookie;
  const out: Record<string, string> = {};
  if (cookie !== null) {
    const c = cookie.split(";");
    for (const kv of c) {
      const [cookieKey, ...cookieVal] = kv.split("=");
      const key = cookieKey.trim();
      out[key] = cookieVal.join("=");
    }
  }

  const flags: Flag[] = [];
  if (out[segmentCookie]) {
    try {
      const segment = JSON.parse(decodeURIComponent(atob(out[segmentCookie])));
      segment.active?.forEach((flag: string) =>
        flags.push({ name: flag, value: true })
      );
      segment.inactiveDrawn?.forEach((flag: string) =>
        flags.push({ name: flag, value: false })
      );
    } catch {
      console.error("Error parsing deco_segment cookie");
    }
  }

  const target = new EventTarget();

  const dispatch: EventsAPI["dispatch"] = (event: unknown) => {
    target.dispatchEvent(new CustomEvent("analytics", { detail: event }));
  };

  const subscribe: EventsAPI["subscribe"] = (handler, opts) => {
    // deno-lint-ignore no-explicit-any
    const cb = ({ detail }: any) => handler(detail);

    handler({ name: "deco", params: { flags, page } });

    target.addEventListener("analytics", cb, opts);

    return () => {
      target.removeEventListener("analytics", cb, opts);
    };
  };

  globalThis.window.DECO_SITES_STD = { sendAnalyticsEvent: dispatch };
  globalThis.window.DECO = {
    ...globalThis.window.DECO,
    events: { dispatch, subscribe },
  };
};

function Events({ deco }: { deco: Deco }) {
  return (
    <Head>
      <script
        defer
        id="deco-events"
        src={scriptAsDataURI(snippet, { deco, segmentCookie: DECO_SEGMENT })}
      />
    </Head>
  );
}

export default Events;
