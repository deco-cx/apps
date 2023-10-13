import {
  default as extend,
  Props,
} from "../../../../website/loaders/extension.ts";
import { ProductDetailsPage } from "../../../types.ts";

/**
 * @title Extend your product
 */
export default function ProductDetailsExt(
  props: Props<ProductDetailsPage | null>,
): Promise<ProductDetailsPage | null> {
  return extend(props);
}
