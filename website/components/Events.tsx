import { Head } from "$fresh/runtime.ts";
import { type Flag } from "deco/types.ts";
import { type AnalyticsEvent } from "../../commerce/types.ts";
import { scriptAsDataURI } from "../../utils/dataURI.ts";

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
const snippet = (flags: Flag[]) => {
  const appendSessionFlags = () => {
    const knownFlags = new Set(flags.map((f) => f.name));
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const ck = cookies[i].trim();

      if (ck.startsWith("deco_matcher_")) {
        const name = atob(ck.slice(ck.indexOf("=") + 1, ck.indexOf("@")));
        const value = ck.at(-1) === "1" ? true : false;

        if (knownFlags.has(name)) continue;

        flags.push({ name, value });
      }
    }
  };

  try {
    appendSessionFlags();
  } catch (error) {
    console.error(error);
  }

  const target = new EventTarget();

  const dispatch: EventsAPI["dispatch"] = (event: unknown) => {
    target.dispatchEvent(new CustomEvent("analytics", { detail: event }));
  };

  const subscribe: EventsAPI["subscribe"] = (handler, opts) => {
    // deno-lint-ignore no-explicit-any
    const cb = ({ detail }: any) => handler(detail);

    handler({ name: "deco-flags", params: flags });

    target.addEventListener("analytics", cb, opts);

    return () => {
      target.removeEventListener("analytics", cb, opts);
    };
  };

  window.DECO_SITES_STD = { sendAnalyticsEvent: dispatch };
  window.DECO = {
    ...window.DECO,
    events: { dispatch, subscribe },
  };
};

function Events({ flags }: { flags: Flag[] }) {
  return (
    <Head>
      <script defer id="deco-events" src={scriptAsDataURI(snippet, flags)} />
    </Head>
  );
}

export default Events;
