import { AppContext } from "../../mod.ts";
import {
  LinxCartItem,
  LinxUser,
  SearchItem,
} from "../../utils/types/analytics.ts";
import { Source } from "../../utils/types/linx.ts";
import { getDeviceIdFromBag } from "../../utils/deviceId.ts";
import getSource from "../../utils/source.ts";

interface CategoryParams {
  page: "category";
  categories: string[];
  tags?: string[];
  searchId?: string;
}

interface ProductParams {
  page: "product";
  pid: string;
  sku?: string;
  price?: number;
}

interface CartParams {
  page: "cart";
  id: string;
  items: LinxCartItem[];
}

interface TransactionParams {
  page: "transaction";
  id: string;
  items: LinxCartItem[];
  total: number;
}

interface SearchParams {
  page: "search";
  query: string;
  items: SearchItem[];
  searchId?: string;
}

interface OtherParams {
  page:
    | "home"
    | "other"
    | "checkout"
    | "landingpage"
    | "notfound"
    | "hotsite"
    | "userprofile";
}

interface ViewEvent {
  event: "view";
  params:
    & (
      | CategoryParams
      | ProductParams
      | CartParams
      | TransactionParams
      | SearchParams
      | OtherParams
    )
    & {
      userId?: string;
      user?: LinxUser;
      source: Source;
    };
}

interface ClickEventParams {
  trackingId: string;
  source: Source;
  user?: LinxUser;
  userId?: string;
  interactionType?: "PRODUCT_VIEW" | "ADD_TO_CART";
}

interface ChaordicClickEventParams {
  trackingId: string;
  userId?: string;
  interactionType: "SHELF_CLICK";
}

interface ClickEvent {
  event: "click";
  params: ClickEventParams | ChaordicClickEventParams;
}

interface ImpressionEvent {
  event: "impression";
  params: {
    trackingImpression: string;
    /**
     * @description Contains the position of the first product shown in the visible area of the product shelf, with index from 0.
     */
    firstOffset: number;
    /**
     * @description Contains the position of the last product shown in the visible area of the product shelf
     */
    lastOffset: number;

    userId?: string;
  };
}

const isChaordicTrackingId = (trackingId: string) => {
  try {
    JSON.parse(atob(trackingId));
    return false;
  } catch {
    return true;
  }
};

/**
 * @docs https://docs.linximpulse.com/api/events/getting-started
 */
const action = async (
  props: ViewEvent | ClickEvent | ImpressionEvent,
  _req: Request,
  ctx: AppContext,
): Promise<null> => {
  const { event, params } = props;
  const {
    eventsApi,
    api,
    salesChannel,
    apiKey,
    chaordicApi,
    origin,
  } = ctx;
  const deviceId = getDeviceIdFromBag(ctx);
  const source = getSource(ctx);

  switch (event) {
    case "view": {
      const { page, source, user, userId } = params;
      const commonBody = {
        apiKey,
        source,
        user,
        userId,
        salesChannel,
        deviceId,
      };

      const headers = {
        "content-type": "application/json",
      };

      switch (page) {
        case "category": {
          const { categories, tags, searchId } = params;
          const path = categories.length === 1
            ? "POST /v7/events/views/category"
            : "POST /v7/events/views/subcategory";
          await eventsApi[path]({}, {
            body: {
              categories,
              tags,
              searchId,
              ...commonBody,
            },
            headers,
          });
          break;
        }
        case "product":
          await eventsApi["POST /v7/events/views/product"]({}, {
            body: {
              pid: params.pid,
              sku: params.sku,
              price: params.price,
              ...commonBody,
            },
            headers,
          });
          break;
        case "cart":
          await eventsApi["POST /v7/events/views/cart"]({}, {
            body: {
              id: params.id,
              items: params.items,
              ...commonBody,
            },
            headers,
          });
          break;
        case "transaction":
          await eventsApi["POST /v7/events/views/transaction"]({}, {
            body: {
              id: params.id,
              items: params.items,
              total: params.total,
              ...commonBody,
            },
            headers,
          });
          break;
        case "search": {
          const { items } = params;
          const path = items.length === 0
            ? "POST /v7/events/views/emptysearch"
            : "POST /v7/events/views/search";
          await eventsApi[path]({}, {
            body: {
              query: params.query,
              searchId: params.searchId,
              // @ts-ignore TODO: fix this
              items,
              ...commonBody,
            },
            headers,
          });
          break;
        }
        default: {
          await eventsApi["POST /v7/events/views/:name"](
            { name: page },
            {
              body: commonBody,
              headers,
            },
          );
        }
      }
      break;
    }
    case "click": {
      const { trackingId, interactionType, userId } = params;

      const isChaordic = isChaordicTrackingId(trackingId);

      // Chaordic event click
      if (interactionType === "SHELF_CLICK") {
        if (!isChaordic) {
          return null;
        }

        await chaordicApi["GET /v0/click"]({
          apiKey,
          trackingId,
          source,
          deviceId,
          interactionType,
          userId,
        });
        return null;
      }

      // Impulse event click
      const { source: paramsSource, user } = params;
      if (!isChaordic) {
        await api["GET /engage/search/v3/clicks"]({
          apiKey,
          trackingId,
          source: paramsSource ?? source,
          userId: userId ?? user?.id,
          interactionType,
          deviceId,
        });
      } else {
        await chaordicApi["GET /v0/click"]({
          apiKey,
          trackingId,
          source,
          userId: userId ?? user?.id,
          interactionType,
          deviceId,
        });
      }
      break;
    }
    case "impression": {
      const { trackingImpression, firstOffset, lastOffset, userId } = params;
      await chaordicApi["GET /v0/impression"]({
        apiKey,
        origin,
        trackingImpression,
        firstOffset,
        lastOffset,
        deviceId,
        userId: userId,
        source,
      });
      break;
    }
  }

  return null;
};

export default action;
