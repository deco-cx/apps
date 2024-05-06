import { AlgoliaV2 } from "../../../algolia/utils/types.ts";
import { ProductListingPage } from "../../../commerce/types.ts";
import { default as extend, Props } from "../../../website/loaders/mapped.ts";

/**
 * @title Mapped your product
 */
export default function ProductDetailsExt(
  props: Props<AlgoliaV2, ProductListingPage | null>,
): Promise<ProductListingPage | null> {
  return extend(props);
}
