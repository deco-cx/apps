import {
  Person,
  ProductDetailsPage,
  ProductListingPage,
} from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import getSource from "../../utils/source.ts";
import type { LinxUser } from "../../utils/types/analytics.ts";

type Page =
  | "home"
  | "category"
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
  user: Person | null;
}

/** @title Linx Impulse Integration - Events */
export const loader = async (props: Props, req: Request, ctx: AppContext) => {
  const { event } = props;
  const page = event.page as Page;

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

  switch (page) {
    case "category": {
      await ctx.invoke["linx-impulse"].actions.analytics.sendEvent({
        event: "view",
        params: {
          page,
          source,
          user,
          categories: url.pathname.slice(1).split("/"),
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
          page,
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
          page,
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
          page,
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
