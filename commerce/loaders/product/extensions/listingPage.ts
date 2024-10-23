import {
  default as extend,
  Props,
} from "../../../../website/loaders/extension.ts";
import { ProductListingPage } from "../../../types.ts";

/**
 * @title Extend your product
 */
export default function ProductDetailsExt(
  props: Props<ProductListingPage | null>,
): Promise<ProductListingPage | null> {
  return extend(props);
}

export const cache = "no-cache";
