import {
  AddToCartEvent,
  AnalyticsItem,
  SelectItemEvent,
} from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import {
  ANONYMOUS_COOKIE,
  SESSION_COOKIE,
} from "../../utils/intelligentSearch.ts";
import { SPEvent } from "../../utils/types.ts";
import { type SectionProps } from "@deco/deco";
import { useScriptAsDataURI } from "@deco/deco/hooks";

const ONE_YEAR_SECS = 365 * 24 * 3600;
const THIRTY_MIN_SECS = 30 * 60;

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? match[1] : null;
};

const setCookie = (name: string, value: string, maxAge: number) => {
  document.cookie =
    `${name}=${value};path=/;max-age=${maxAge};secure;SameSite=Lax`;
};

const getOrCreateISCookies = () => {
  let anonymous = getCookie(ANONYMOUS_COOKIE);
  if (!anonymous) {
    anonymous = crypto.randomUUID();
    setCookie(ANONYMOUS_COOKIE, anonymous, ONE_YEAR_SECS);
  }

  let session = getCookie(SESSION_COOKIE);
  if (!session) {
    session = crypto.randomUUID();
  }
  // Always re-set session cookie to simulate sliding expiration
  setCookie(SESSION_COOKIE, session, THIRTY_MIN_SECS);

  return { anonymous, session };
};

const snippet = (account: string) => {
  const cookies = getOrCreateISCookies();

  const url = new URL(globalThis.location.href);
  const isSearch = url.searchParams.get("q");
  const apiUrl = `https://sp.vtex.com/event-api/v1/${account}/event`;
  const baseProps = {
    agent: navigator.userAgent,
    ...cookies,
  };
  const eventFetch = (props: SPEvent) => {
    fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({
        ...baseProps,
        ...props,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
  // deno-lint-ignore no-explicit-any
  function isSelectItemEvent(event: any): event is SelectItemEvent {
    return event.name === "select_item";
  }
  // deno-lint-ignore no-explicit-any
  function isCartEvent(event: any): event is AddToCartEvent {
    const cartEvents = ["remove_from_cart", "add_to_cart", "view_cart"];
    return cartEvents.includes(event.name);
  }
  type WithID<T> = T & {
    item_id: string;
  };
  const hasItemId = <T,>(item: T): item is WithID<T> =>
    // deno-lint-ignore no-explicit-any
    typeof (item as any).item_id === "string";
  // Session ping
  if (isSearch) {
    setInterval(() => {
      eventFetch({
        type: "session.ping",
        url: url.href,
      });
    }, 1000 * 60);
  }
  globalThis.window.DECO.events.subscribe((event) => {
    if (isCartEvent(event)) {
      const products: {
        productId: string;
        quantity: number;
      }[] = [];
      event.params?.items?.forEach((item: AnalyticsItem) => {
        if (hasItemId(item)) {
          products.push({
            productId: item.item_id,
            quantity: item.quantity,
          });
        }
      });
      eventFetch({
        type: "page.cart",
        products: products,
      });
    }
    if (isSelectItemEvent(event) && isSearch) {
      const [item] = event.params.items;
      if (hasItemId(item)) {
        eventFetch({
          type: "search.click",
          productId: item.item_id,
          position: item.index || 0,
          url: url.href,
          text: url.searchParams.get("q") || "",
        });
      }
    }
  });
};
export default function VtexAnalytics(
  { account }: SectionProps<typeof loader>,
) {
  return (
    <script
      type="text/javascript"
      defer
      src={useScriptAsDataURI(snippet, account)}
    />
  );
}
export const loader = (_props: unknown, _req: Request, ctx: AppContext) => {
  return {
    account: ctx.account,
  };
};
