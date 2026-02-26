import type {
  Person,
  ProductDetailsPage,
  ProductListingPage,
} from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { getDeviceIdFromBag } from "../../utils/deviceId.ts";
import getSource from "../../utils/source.ts";
import {
  getTrackingImpressionFromImpressionUrl,
  toProduct,
  toPropertyValue,
} from "../../utils/transform.ts";
import type {
  PageName,
  Position,
  RecommendationShelf,
} from "../../utils/types/chaordic.ts";
import type { LinxImpulseShelf } from "../../utils/types/linx.ts";

interface BaseProps {
  /**
   * @hide
   */
  page: PageName;
  showDummyProducts?: boolean;
  showOnlyAvailable?: boolean;

  /**
   * @hide
   */
  userId?: string;

  /**
   * @title User
   * @description Used to sync user data with linx impulse
   */
  user: Person | null;
}

/**
 * @title Home Page
 */
interface HomePageProps extends BaseProps {
  /**
   * @hide
   */
  page: "home";
}

/**
 * @title Product Page
 */
interface ProductPageProps extends BaseProps {
  /**
   * @hide
   */
  page: "product";
  /**
   * @description It is recommended to create a global loader so that the loader is not called more than once
   */
  loader: ProductDetailsPage | null;
  /**
   * @ignore
   */
  productId?: string;
}

/**
 * @title Category Page
 */
interface CategoryPageProps extends BaseProps {
  /**
   * @hide
   */
  page: "category";
  /**
   * @description It is recommended to create a global loader so that the loader is not called more than once
   */
  loader: ProductListingPage | null;
  /**
   * @ignore
   */
  categoryIds?: string[];
}

/**
 * @title Search Page
 */
interface SearchPageProps extends BaseProps {
  /**
   * @hide
   */
  page: "search";
  /**
   * @description It is recommended to create a global loader so that the loader is not called more than once
   */
  loader: ProductListingPage | null;
  /**
   * @ignore
   */
  productIds?: string[];
}

const nonNullable = <T>(value: T): value is NonNullable<T> =>
  value != null && typeof value !== "undefined";
const normalize = (value: string) =>
  value.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

interface Props {
  props:
    | HomePageProps
    | ProductPageProps
    | CategoryPageProps
    | SearchPageProps;
  /**
   * @title Force Source
   * @description Force the source of the request
   */
  forceSource?: "desktop" | "mobile";
}

const generateParams = (
  props: Props["props"],
  req: Request,
): { name: PageName } & Record<string, unknown> => {
  switch (props.page) {
    case "home": {
      return {
        name: "home",
      };
    }
    case "category": {
      const categoryIds = props.categoryIds ??
        props.loader?.breadcrumb.itemListElement.map((item) => item.name!);
      // use breadcrumb entries as categoryIds

      if (categoryIds) {
        return {
          name: categoryIds.length > 1 ? "subcategory" : "category",
          "categoryId[]": categoryIds,
        };
      }

      const properties = props.loader?.products
        .flatMap((p) => p?.additionalProperty)
        .filter(nonNullable) ?? [];
      const categoriesId = new URL(req.url).pathname
        .toLowerCase()
        .slice(1)
        .split("/")
        .map((category) =>
          properties
            .find((p) =>
              p.name === "category" &&
              p.value &&
              p.propertyID &&
              normalize(p.value!) === category
            )
            ?.propertyID
        )
        .filter(nonNullable) ?? [];

      return {
        name: categoriesId.length > 1 ? "subcategory" : "category",
        "categoryId[]": categoriesId,
      };
    }
    case "search": {
      const productIds = props.productIds ?? props.loader?.products
        .map((p) =>
          p.isVariantOf?.productGroupID ??
            p.productID
        )
        .filter(nonNullable) ??
        [];

      if (!productIds?.length) {
        return {
          name: "emptysearch",
        };
      }

      return {
        name: "search",
        "productId[]": productIds,
      };
    }
    case "product": {
      const productId = props.productId ??
        props.loader?.product.isVariantOf?.productGroupID ??
        props.loader?.product.productID;
      return {
        name: "product",
        "productId[]": productId ? [productId] : [],
      };
    }
    default: {
      return {
        name: "other",
      };
    }
  }
};

function toLinxImpulseShelf(
  shelf: RecommendationShelf,
  position: Position,
  origin: string,
  cdn: string,
): LinxImpulseShelf {
  return {
    trackingImpression: getTrackingImpressionFromImpressionUrl(
      shelf.impressionUrl,
    ),
    position,
    feature: shelf.feature,
    products: shelf.displays[0].recommendations.map(
      (p) => {
        const shelfTitle = shelf.title;
        const parsed = toProduct(p, origin, cdn);
        parsed.isVariantOf?.additionalProperty?.push(toPropertyValue({
          name: "shelfTitle",
          value: shelfTitle,
        }));

        return parsed;
      },
    ),
  };
}

/**
 * @title Linx Impulse - Shelves Loader
 */
const loader = async (
  { props, forceSource }: Props,
  req: Request,
  ctx: AppContext,
): Promise<LinxImpulseShelf[] | null> => {
  if (req.url.includes("_frsh")) {
    return null;
  }

  const { showOnlyAvailable, userId: _userId, user } = props;
  const { chaordicApi, apiKey, salesChannel, origin, cdn } = ctx;
  const deviceId = getDeviceIdFromBag(ctx);
  const source = forceSource ?? getSource(ctx);

  const url = new URL(req.url);
  const dummy = url.searchParams.get("dummy") || undefined;

  const params = generateParams(props, req);
  const userId = _userId ?? user?.["@id"];
  const headers = new Headers();
  if (origin) {
    headers.set("Origin", origin);
  }

  const { top, middle, bottom } = await chaordicApi
    ["GET /v0/pages/recommendations"]({
      ...params,
      apiKey,
      deviceId,
      source,
      salesChannel,
      showOnlyAvailable,
      userId,
      productFormat: "complete",
      dummy: props.showDummyProducts || (dummy === "true" || dummy === "1")
        ? true
        : undefined,
    }, {
      headers,
      // TODO: This is a temporary fix for the async rendering issue (https://discord.com/channels/985687648595243068/1236027748674306078)
      signal: new AbortController().signal,
    }).then((res) => res.json());

  const reqOrigin = url.origin;

  return [
    ...top.map((shelf) => toLinxImpulseShelf(shelf, "top", reqOrigin, cdn)),
    ...middle.map((shelf) =>
      toLinxImpulseShelf(shelf, "middle", reqOrigin, cdn)
    ),
    ...bottom.map((shelf) =>
      toLinxImpulseShelf(shelf, "bottom", reqOrigin, cdn)
    ),
  ];
};

export default loader;
