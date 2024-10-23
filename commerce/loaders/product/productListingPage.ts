import {
  default as extend,
  Props,
} from "../../../website/loaders/extension.ts";
import { ProductListingPage } from "../../types.ts";

/**
 * @title Extend your product
 * @deprecated
 */
export default function ProductDetailsExt(
  props: Props<ProductListingPage | null>,
): Promise<ProductListingPage | null> {
  return extend(props);
}
