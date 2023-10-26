import {
  default as extend,
  Props,
} from "../../../website/loaders/extension.ts";
import { Product } from "../../types.ts";

/**
 * @title Extend your products
 * @deprecated
 */
export default function ProductsExt(
  props: Props<Product[] | null>,
): Promise<Product[] | null> {
  return extend(props);
}
