import type {
  Product,
  ProductGroup,
  PropertyValue,
} from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { Feature, Position } from "../../utils/types/chaordic.ts";

interface Props {
  /**
   * @title Shelves
   * @description Is mandatory to use a reusable loader, so the loader is not called more than once. If you don't use a reusable loader, your store analytics and performance will be affected. See more: https://deco.cx/docs/en/performance/loaders
   */
  shelves: ProductGroup[] | null;
  /**
   * @title Feature
   * @description Search for a specific feature, if not informed or found, the first one will be used
   */
  feature?: Feature;
  /**
   * @title Position
   * @description Position of the shelf
   */
  position?: Position;
  /**
   * @title Index
   * @description Index of the shelf, in case of more than one with the same feature and position
   * @default 0
   * @minimum 0
   */
  index?: number;
}

function findShelf({ shelves, position, feature, index = 0 }: Props) {
  if (!shelves) {
    return;
  }

  if (!feature && !position) {
    return shelves[index];
  }

  return shelves.filter(({ additionalType, identifier }) => {
    if (feature && position) {
      return additionalType === position && identifier === feature;
    }

    if (feature) {
      return identifier === feature;
    }

    if (position) {
      return additionalType === position;
    }

    return false;
  })[index];
}

/**
 * @title Linx Impulse - Product List Loader
 */
const loader = (
  props: Props,
  req: Request,
  _ctx: AppContext,
): Product[] | null => {
  if (req.url.includes("_frsh") || !props.shelves) {
    return null;
  }

  const shelf = findShelf(props);

  if (!shelf) {
    return null;
  }

  const products = shelf.hasVariant.map((product) => {
    const impressionProperty: PropertyValue = {
      "@type": "PropertyValue",
      name: "trackingImpression",
      value: shelf.additionalProperty.find((p) =>
        p.name === "trackingImpression"
      )?.value,
    };

    if (Array.isArray(product.additionalProperty)) {
      product.additionalProperty.push(impressionProperty);
    } else {
      product.additionalProperty = [impressionProperty];
    }
    return product;
  });

  return products;
};

export default loader;
