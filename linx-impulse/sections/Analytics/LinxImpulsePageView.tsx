import {
  Person,
  ProductDetailsPage,
  ProductListingPage,
} from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import getSource from "../../utils/source.ts";
import type { LinxMeta, LinxUser } from "../../utils/types/analytics.ts";

declare global {
  interface Window {
    linxMeta: LinxMeta;
  }
}

interface Category {
  /**
   * @default category
   */
  page: string;
  pageInfo: ProductListingPage | null;
}

interface Product {
  /**
   * @default product
   */
  page: string;
  details: ProductDetailsPage | null;
}

interface Home {
  /**
   * @default home
   */
  page: string;
}

interface Other {
  /**
   * @default other
   */
  page: string;
}

interface Search {
  /**
   * @default search
   */
  page: string;
  result: ProductListingPage | null;
}

interface Checkout {
  /**
   * @default checkout
   */
  page: string;
}

interface LandingPage {
  /**
   * @default landingpage
   */
  page: string;
}

interface NotFound {
  /**
   * @default notfound
   */
  page: string;
}

interface Hotsite {
  /**
   * @default hotsite
   */
  page: string;
}

interface UserProfile {
  /**
   * @default userprofile
   */
  page: string;
}

/**
 * @title none
 */
type Null = null;

interface Props {
  /**
   * @title Event
   * @description "cart" and "transaction" events are not supported by this section. To track these events, implement them manually in your code.
   */
  event:
    | Home
    | Category
    | Product
    | Search
    | Other
    | Checkout
    | LandingPage
    | NotFound
    | Hotsite
    | UserProfile;
  user: Person | Null;
}

/** @title Linx Impulse Integration - Events */
export const loader = async (props: Props, req: Request, ctx: AppContext) => {
  const { device } = ctx;
  const { event } = props;

  const url = new URL(req.url);
  const source = getSource(ctx);
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

  switch (event.page) {
    case "category": {
      if (!("pageInfo" in event)) break;
      await ctx.invoke["linx-impulse"].actions.analytics.sendEvent({
        event: "view",
        params: {
          page: "category",
          source,
          user,
          categories:
            event.pageInfo?.breadcrumb?.itemListElement?.filter((item) =>
              item.name
            ).map((item) => item.name!) ?? [],
        },
      });
      break;
    }
    case "product": {
      if (!("details" in event) || !event.details) break;
      const { details } = event;

      await ctx.invoke["linx-impulse"].actions.analytics.sendEvent({
        event: "view",
        params: {
          page: "product",
          source,
          user,
          pid: details.product.isVariantOf?.productGroupID ??
            details.product.productID,
          price: details.product.offers?.lowPrice,
          sku: details.product.sku,
        },
      });
      break;
    }
    case "search": {
      if (!("result" in event) || !event.result) break;
      const { result } = event;

      const query = url.searchParams.get("q") ??
        url.pathname.split("/").pop() ?? "";

      await ctx.invoke["linx-impulse"].actions.analytics.sendEvent({
        event: "view",
        params: {
          page: "search",
          source,
          user,
          query,
          items: result.products.map((product) => ({
            pid: product.isVariantOf?.productGroupID ?? product.productID,
            sku: product.sku,
          })),
        },
      });
      break;
    }
    default: {
      await ctx.invoke["linx-impulse"].actions.analytics.sendEvent({
        event: "view",
        params: {
          page: event.page as
            | "home"
            | "checkout"
            | "landingpage"
            | "notfound"
            | "hotsite"
            | "userprofile"
            | "other",
          source,
          user,
        },
      });
      break;
    }
  }
};

export default function LinxImpulsePageView() {
  return null;
}
