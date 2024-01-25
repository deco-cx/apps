import { SectionProps } from "deco/blocks/section.ts";
import insights from "npm:search-insights@2.9.0";
import {
  AddToCartEvent,
  SelectItemEvent,
  ViewItemEvent,
  ViewItemListEvent,
} from "../../../commerce/types.ts";
import { scriptAsDataURI } from "../../../utils/dataURI.ts";
import { AppContext } from "../../mod.ts";

declare global {
  interface Window {
    aa: typeof insights.default;
  }
}

const setupAndListen = (appId: string, apiKey: string, version: string) => {
  function setupScriptTag() {
    globalThis.window.AlgoliaAnalyticsObject = "aa";
    globalThis.window.aa = globalThis.window.aa ||
      function () {
        // @ts-expect-error monkey patch before initialization
        (globalThis.window.aa.queue = globalThis.window.aa.queue || []).push(
          arguments,
        );
      };
    globalThis.window.aa.version = version;

    const script = document.createElement("script");
    script.setAttribute("async", "");
    script.setAttribute(
      "src",
      `https://cdn.jsdelivr.net/npm/search-insights@${version}/dist/search-insights.min.js`,
    );
    document.head.appendChild(script);
  }

  function createUserToken() {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }

    return (Math.random() * 1e9).toFixed();
  }

  function setupSession() {
    globalThis.window.aa("init", { appId, apiKey });

    const userToken = localStorage.getItem("ALGOLIA_USER_TOKEN") ||
      createUserToken();
    localStorage.setItem("ALGOLIA_USER_TOKEN", userToken);
    globalThis.window.aa("setUserToken", userToken);
  }

  function setupEventListeners() {
    function attributesFromURL(href: string) {
      const url = new URL(href);
      const queryID = url.searchParams.get("algoliaQueryID");
      const indexName = url.searchParams.get("algoliaIndex");

      // Not comming from an algolia search page
      if (!queryID || !indexName) {
        return null;
      }

      return { queryID, indexName };
    }

    // deno-lint-ignore no-explicit-any
    function isSelectItemEvent(event: any): event is SelectItemEvent {
      return event.name === "select_item";
    }

    // deno-lint-ignore no-explicit-any
    function isAddToCartEvent(event: any): event is AddToCartEvent {
      return event.name === "add_to_cart";
    }

    function isViewItem(
      // deno-lint-ignore no-explicit-any
      event: any,
    ): event is ViewItemEvent | ViewItemListEvent {
      return event.name === "view_item" || event.name === "view_item_list";
    }

    type WithID<T> = T & { item_id: string };

    const hasItemId = <T,>(item: T): item is WithID<T> =>
      // deno-lint-ignore no-explicit-any
      typeof (item as any).item_id === "string";

    const PRODUCTS = "products";
    const MAX_BATCH_SIZE = 20;

    globalThis.window.DECO.events.subscribe((event) => {
      if (!event) return;

      const eventName = event.name;

      if (isSelectItemEvent(event)) {
        const [item] = event.params.items;

        if (
          !item ||
          !hasItemId(item) ||
          typeof item.index !== "number" ||
          typeof item.item_url !== "string"
        ) {
          return console.warn(
            "Failed sending event to Algolia. Missing index, item_id or item_url",
            JSON.stringify(event, null, 2),
          );
        }

        const attr = attributesFromURL(item.item_url);

        if (attr) {
          globalThis.window.aa("clickedObjectIDsAfterSearch", {
            eventName,
            index: attr.indexName,
            queryID: attr.queryID,
            objectIDs: [item.item_id],
            positions: [item.index + 1],
          });
        } else {
          globalThis.window.aa("clickedObjectIDs", {
            eventName,
            index: PRODUCTS,
            objectIDs: [item.item_id],
          });
        }
      }

      if (isAddToCartEvent(event)) {
        const [item] = event.params.items;

        const attr = attributesFromURL(globalThis.window.location.href) ||
          attributesFromURL(item.item_url || "");
        const objectIDs = event.params.items
          .filter(hasItemId)
          .map((i) => i.item_id);

        if (attr) {
          globalThis.window.aa("convertedObjectIDsAfterSearch", {
            eventName,
            objectIDs,
            index: attr.indexName,
            queryID: attr.queryID,
          });
        } else {
          globalThis.window.aa("convertedObjectIDs", {
            eventName,
            index: PRODUCTS,
            objectIDs,
          });
        }
      }

      if (isViewItem(event)) {
        const objectIDs = event.params.items
          .filter(hasItemId)
          .map((i) => i.item_id);

        for (let it = 0; it < objectIDs.length; it += MAX_BATCH_SIZE) {
          globalThis.window.aa("viewedObjectIDs", {
            eventName,
            index: PRODUCTS,
            objectIDs: objectIDs.slice(it, (it + 1) * MAX_BATCH_SIZE),
          });
        }
      }
    });
  }

  setupScriptTag();
  setupSession();
  setupEventListeners();
};

function Analytics({
  applicationId,
  searchApiKey,
}: SectionProps<typeof loader>) {
  return (
    <script
      defer
      src={scriptAsDataURI(
        setupAndListen,
        applicationId,
        searchApiKey,
        (insights as unknown as typeof insights.default).version!,
      )}
    />
  );
}

/** @title Algolia Integration - Events */
export const loader = (_props: unknown, _req: Request, ctx: AppContext) => ({
  applicationId: ctx.applicationId,
  searchApiKey: ctx.searchApiKey,
});

export default Analytics;
