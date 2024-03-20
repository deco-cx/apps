import {
  AddToCartEvent,
  AnalyticsItem,
  SelectItemEvent,
} from "../../../commerce/types.ts";
import { scriptAsDataURI } from "../../../utils/dataURI.ts";
import { AppContext } from "../../mod.ts";
import { SectionProps } from "deco/blocks/section.ts";
import { getISCookiesFromBag } from "../../utils/intelligentSearch.ts";
import { SPEvent } from "../../utils/types.ts";

interface ISCookies {
  // deno-lint-ignore no-explicit-any
  anonymous: any;
  // deno-lint-ignore no-explicit-any
  session: any;
}

const snippet = (account: string, agent: string, cookies: ISCookies | null) => {
  const url = new URL(window.location.href);
  const isSearch = url.searchParams.get("q");
  const apiUrl = `https://sp.vtex.com/event-api/v1/${account}/event`;

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

  const baseProps = {
    agent,
    ...cookies,
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

  type WithID<T> = T & { item_id: string };

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
      const products: { productId: string; quantity: number }[] = [];
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
  { account, agent, cookies }: SectionProps<typeof loader>,
) {
  return (
    <script
      type="text/javascript"
      defer
      src={scriptAsDataURI(snippet, account, agent, cookies)}
    />
  );
}

export const loader = (_props: unknown, req: Request, ctx: AppContext) => {
  const cookies = getISCookiesFromBag(ctx);

  return {
    account: ctx.account,
    agent: req.headers.get("user-agent") || "deco-sites/apps",
    cookies,
  };
};
