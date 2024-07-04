import {
    default as extend,
    Props,
} from "../../../website/loaders/extension.ts";
import { Product } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
/**
 * @title Magento Extension - Product List
 * @description Add extra data to your loader. This may harm performance
 */
export default function ProductDetailsExt(
    props: Props<Product[] | null>,
): Promise<Product[] | null> {
    return extend(props);
}

export const cache = "stale-while-revalidate";

export const cacheKey = (
    props: Props<Product[] | null>,
    _req: Request,
    _ctx: AppContext,
) => {
    const skus = props.data?.reduce((acc, p) => `${acc}|${p.sku}`, "");
    return `${skus}-listExtension`;
};
