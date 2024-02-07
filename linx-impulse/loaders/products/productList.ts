import type {
  Product,
  ProductDetailsPage,
  ProductListingPage,
  PropertyValue,
} from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import getDeviceId from "../../utils/deviceId.ts";
import getSource from "../../utils/source.ts";
import { toProduct } from "../../utils/transform.ts";
import type { PageName } from "../../utils/types/chaordic.ts";

interface BaseProps {
  /**
   * @hide
   */
  page: PageName;
  /**
   * @title Feature
   * @description Search for a specific feature, if not informed or found, the first one will be used
   * @format dynamic-options
   * @options linx-impulse/loaders/products/options.ts?type=home
   */
  feature?: string;
  showOnlyAvailable?: boolean;
}

/**
 * @title Home Page
 */
interface HomePageProps extends BaseProps {
  /**
   * @hide
   */
  page: "home";
  /**
   * @title Feature
   * @description Search for a specific feature, if not informed or found, the first one will be used
   * @format dynamic-options
   * @options linx-impulse/loaders/products/options.ts?type=home
   */
  feature?: string;
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
   * @title Feature
   * @description Search for a specific feature, if not informed or found, the first one will be used
   * @format dynamic-options
   * @options linx-impulse/loaders/products/options.ts?type=product
   */
  feature?: string;
  /**
   * @description It is recommended to create a global loader so that the loader is not called more than once
   */
  loader: ProductDetailsPage | null;
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
   * @title Feature
   * @description Search for a specific feature, if not informed or found, the first one will be used
   * @format dynamic-options
   * @options linx-impulse/loaders/products/options.ts?type=category
   */
  feature?: string;
  /**
   * @description It is recommended to create a global loader so that the loader is not called more than once
   */
  loader: ProductListingPage | null;
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
   * @title Feature
   * @description Search for a specific feature, if not informed or found, the first one will be used
   * @format dynamic-options
   * @options linx-impulse/loaders/products/options.ts?type=search
   */
  feature?: string;
  /**
   * @description It is recommended to create a global loader so that the loader is not called more than once
   */
  loader: ProductListingPage | null;
}

const nonNullable = <T>(value: T): value is NonNullable<T> =>
  value != null && typeof value !== "undefined";
const normalize = (value: string) =>
  value.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/**
 * @title Page
 */
type Props =
  | HomePageProps
  | ProductPageProps
  | CategoryPageProps
  | SearchPageProps;

const generateParams = (
  props: Props,
  req: Request,
): { name: PageName } & Record<string, unknown> => {
  switch (props.page) {
    case "home": {
      return {
        name: "home",
      };
    }
    case "category": {
      const properties = props.loader?.products
        .flatMap((p) => p.isVariantOf?.additionalProperty)
        .filter(nonNullable) ?? [];
      const categoriesId = new URL(req.url).pathname
        .toLowerCase()
        .slice(1)
        .split("/")
        .map((category) =>
          properties
            .find((p) =>
              p.name === "category" &&
              p.propertyID &&
              normalize(p.value ?? "") === category
            )
            ?.propertyID
        )
        .filter(nonNullable) ?? [];

      console.log({ categoriesId });

      return {
        name: categoriesId.length > 1 ? "subcategory" : "category",
        "categoryId[]": categoriesId,
      };
    }
    case "search": {
      const productIds = props.loader?.products
        .map((p) => p.productID)
        .filter(nonNullable) ?? [];
      return {
        name: "search",
        "productId[]": productIds,
      };
    }
    case "product": {
      const productId = props.loader?.product.productID;
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

type Position = "top" | "middle" | "bottom";

/**
 * @title Linx Impulse - Chaordic System
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  if (req.url.includes("_frsh")) {
    return null;
  }

  const { showOnlyAvailable } = props;
  const { chaordicApi, apiKey, secretKey, salesChannel, origin, cdn } = ctx;
  const deviceId = getDeviceId(req, ctx);
  const source = getSource(ctx);

  const params = generateParams(props, req);
  const headers = new Headers();
  if (origin) {
    headers.set("Origin", origin);
  }

  const response = await chaordicApi["GET /v0/pages/recommendations"]({
    ...params,
    apiKey,
    secretKey,
    deviceId,
    source,
    salesChannel,
    showOnlyAvailable,
    productFormat: "complete",
  }, { headers }).then((res) => res.json());

  const [feature, position] = props.feature ? props.feature.split(",") : [];
  const shelves = position
    ? response[position as Position] ?? response.top
    : [...response.top, ...response.middle, ...response.bottom];
  const shelf = feature
    ? shelves.find((s) => s.feature === feature) || shelves[0]
    : shelves[0];

  if (!shelf || !shelf.displays.length) {
    return null;
  }

  const trackingImpression = new URL(shelf.impressionUrl).searchParams.get(
    "trackingImpression",
  );
  const products = shelf.displays[0].recommendations.map((p) => {
    const product = toProduct(p, new URL(req.url).origin, cdn);
    const impressionProperty: PropertyValue = {
      "@type": "PropertyValue",
      name: "trackingImpression",
      value: trackingImpression ?? "",
    };

    if (Array.isArray(product.additionalProperty)) {
      product.additionalProperty.push(impressionProperty);
      return product;
    }

    product.additionalProperty = [impressionProperty];

    return product;
  });

  return products;
};

export default loader;
