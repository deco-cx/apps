import {
  PageInfo,
  Person,
  ProductDetailsPage,
  ProductListingPage,
} from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import getSource from "../../utils/source.ts";
import type { LinxUser } from "../../utils/types/analytics.ts";
import { getDeviceIdFromBag } from "../../utils/deviceId.ts";
import { type SectionProps } from "@deco/deco";
import { useScriptAsDataURI } from "@deco/deco/hooks";
type Page =
  | "home"
  | "category"
  | "subcategory"
  | "product"
  | "search"
  | "checkout"
  | "landingpage"
  | "notfound"
  | "hotsite"
  | "userprofile"
  | "other";
interface Category {
  /**
   * @hide
   * @default category
   */
  page: string;
  products: ProductListingPage | null;
}
interface Subcategory {
  /**
   * @hide
   * @default subcategory
   */
  page: string;
  products: ProductListingPage | null;
}
interface Product {
  /**
   * @hide
   * @default product
   */
  page: string;
  details: ProductDetailsPage | null;
}
interface Home {
  /**
   * @hide
   * @default home
   */
  page: string;
}
interface Other {
  /**
   * @hide
   * @default other
   */
  page: string;
}
interface Search {
  /**
   * @hide
   * @default search
   */
  page: string;
  result: ProductListingPage | null;
}
interface Checkout {
  /**
   * @hide
   * @default checkout
   */
  page: string;
}
interface LandingPage {
  /**
   * @hide
   * @default landingpage
   */
  page: string;
}
interface NotFound {
  /**
   * @hide
   * @default notfound
   */
  page: string;
}
interface Hotsite {
  /**
   * @hide
   * @default hotsite
   */
  page: string;
}
interface UserProfile {
  /**
   * @hide
   * @default userprofile
   */
  page: string;
}
interface SendViewEventParams {
  page: Page | string;
  // deno-lint-ignore no-explicit-any
  body?: Record<string, any>;
}
interface Props {
  /**
   * @title Event
   * @description "cart" and "transaction" events are not supported by this section. To track these events, implement them manually in your code.
   */
  event:
    | Home
    | Category
    | Subcategory
    | Product
    | Search
    | Other
    | Checkout
    | LandingPage
    | NotFound
    | Hotsite
    | UserProfile;
  user: Person | null;
}
/** @title Linx Impulse Integration - Events */
export const script = async (props: SectionProps<typeof loader>) => {
  const { event, source, apiKey, salesChannel, url: urlStr, deviceId } = props;
  if (!event) {
    return;
  }
  const { page } = event;
  const user: LinxUser | undefined = props.user
    ? {
      id: props.user["@id"] ?? props.user.email ?? "",
      email: props.user.email ?? "",
      gender: props.user.gender === "https://schema.org/Female" ? "F" : "M",
      name: props.user.name,
      // TODO: get these from user
      allowMailMarketing: false,
      birthday: undefined,
    }
    : undefined;
  const sendViewEvent = (params: SendViewEventParams) => {
    const baseUrl = new URL(
      `https://api.event.linximpulse.net/v7/events/views/${params.page}`,
    );
    // deviceId && baseUrl.searchParams.append("deviceId", deviceId);
    const headers = new Headers();
    headers.set("content-type", "application/json");
    props.origin && headers.set("origin", props.origin);
    return fetch(baseUrl.toString(), {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({
        apiKey,
        source,
        user,
        deviceId,
        salesChannel,
        ...params.body,
      }),
    });
  };
  const getSearchIdFromPageInfo = (pageInfo?: PageInfo | null) => {
    const searchIdInPageTypes = pageInfo?.pageTypes?.find((pageType) =>
      pageType?.startsWith("SearchId:")
    );
    return searchIdInPageTypes?.replace("SearchId:", "");
  };
  const getCategoriesFromPage = (page: ProductListingPage) => {
    if (page.breadcrumb.itemListElement.length) {
      return page.breadcrumb.itemListElement.map((item) => item.name!);
    } else {
      const departmentsFilter = page.filters.find((filter) =>
        filter.key === "Departments"
      )?.values;
      if (Array.isArray(departmentsFilter)) {
        return departmentsFilter.map((value) => value.label);
      }
    }
  };
  const getItemsFromProducts = (products?: ProductListingPage["products"]) => {
    return (products?.map((product) => {
      return {
        pid: product.isVariantOf?.productGroupID ?? product.productID,
        sku: product.sku,
      };
    }) ?? []);
  };
  const url = new URL(urlStr);
  switch (page) {
    case "category": {
      let searchId: string | undefined;
      let categories: string[] | undefined;
      if ("products" in event && event.products) {
        const query = url.searchParams.get("q");
        const searchIndex =
          event.products.pageInfo.pageTypes?.findIndex((pageType) =>
            pageType === "Search"
          ) ?? -1;
        // If page has a search term
        if (searchIndex > 0 || query) {
          const items = getItemsFromProducts(event.products.products);
          await sendViewEvent({
            page: "search",
            body: {
              query: query || url.pathname.split("/").at(-1) || "",
              items,
              searchId,
            },
          });
          break;
        }
        searchId = getSearchIdFromPageInfo(event.products.pageInfo);
        categories = getCategoriesFromPage(event.products);
      }
      await sendViewEvent({
        page: (categories?.length ?? 1) === 1 ? "category" : "subcategory",
        body: {
          categories,
          searchId,
        },
      });
      break;
    }
    case "subcategory": {
      let searchId: string | undefined;
      let categories: string[] | undefined;
      if ("products" in event && event.products) {
        searchId = getSearchIdFromPageInfo(event.products.pageInfo);
        categories = getCategoriesFromPage(event.products);
      }
      await sendViewEvent({
        page: "subcategory",
        body: {
          categories,
          searchId,
        },
      });
      break;
    }
    case "product": {
      if (!("details" in event) || !event.details) {
        break;
      }
      const { details } = event;
      await sendViewEvent({
        page,
        body: {
          pid: details.product.isVariantOf?.productGroupID ??
            details.product.productID,
          price: details.product.offers?.lowPrice,
          sku: details.product.sku,
        },
      });
      break;
    }
    case "search": {
      const searchId = getSearchIdFromPageInfo(
        "result" in event && event.result ? event.result.pageInfo : undefined,
      );
      const query = url.searchParams.get("q") ??
        url.pathname.split("/").pop() ?? "";
      if (
        !("result" in event) ||
        !event.result ||
        !event.result.products.length
      ) {
        return sendViewEvent({
          page: "emptysearch",
          body: {
            query,
            items: [],
            searchId,
          },
        });
      }
      const { result } = event;
      const items = getItemsFromProducts(result.products);
      await sendViewEvent({
        page,
        body: {
          query,
          items,
          searchId,
        },
      });
      break;
    }
    case "landingpage": {
      await sendViewEvent({
        page: "landing_page",
      });
      break;
    }
    case "notfound": {
      await sendViewEvent({
        page: "not_found",
      });
      break;
    }
    default: {
      await sendViewEvent({
        page,
      });
      break;
    }
  }
};
/** @title Linx Impulse - Page View Events */
export const loader = (props: Props, req: Request, ctx: AppContext) => ({
  ...props,
  apiKey: ctx.apiKey,
  salesChannel: ctx.salesChannel,
  source: getSource(ctx),
  url: req.url,
  deviceId: getDeviceIdFromBag(ctx),
  origin: ctx.origin,
});
export default function LinxImpulsePageView(
  props: SectionProps<typeof loader>,
) {
  return (
    <div>
      <script defer src={useScriptAsDataURI(script, props)} />
      <span class="hidden">
        {/* The props from loaders come undefined when Async Rendering is active. */}
        {/* Calling them below forces them to be recognized as "being used" */}
        {!!props.user?.email && "user ok"}
        {"details" in props.event && props.event.details?.product?.productID}
        {"result" in props.event && props.event.result?.products?.length}
        {"products" in props.event && props.event.products?.products?.length}
      </span>
    </div>
  );
}
