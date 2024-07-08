import {
  default as extend,
  Props,
} from "../../../website/loaders/extension.ts";
import { ProductListingPage } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { sortSearchParams } from "../../utils/utils.ts";

/**
 * @title Magento Extension - Product Listing Page
 * @description Add extra data to your loader. This may harm performance
 */
export default function ProductDetailsExt(
  props: Props<ProductListingPage | null>,
): Promise<ProductListingPage | null> {
  return extend(props);
}

export const cache = "stale-while-revalidate";

export const cacheKey = (
  props: Props<ProductListingPage | null>,
  req: Request,
  _ctx: AppContext,
) => {
  const url = new URL(req.url);
  const searchParams = sortSearchParams(url);
  const skus = props.data?.products.reduce((acc, p) => `${acc}|${p.sku}`, "");
  return `${url.pathname}-params:${searchParams}-skus:${skus}-plpExtension`;
};
