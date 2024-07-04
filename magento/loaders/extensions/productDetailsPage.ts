import {
    default as extend,
    Props,
} from "../../../website/loaders/extension.ts";
import { ProductDetailsPage } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
/**
 * @title Magento Extension - Product Details Page
 * @description Add extra data to your loader. This may harm performance
 */
export default function ProductDetailsExt(
    props: Props<ProductDetailsPage | null>,
): Promise<ProductDetailsPage | null> {
    return extend(props);
}

export const cache = "stale-while-revalidate";

export const cacheKey = (
    props: Props<ProductDetailsPage | null>,
    req: Request,
    _ctx: AppContext,
) => {
    const url = new URL(req.url);
    const sku = props.data?.product.sku;
    const addProps = props.data?.product.additionalProperty?.map((p) =>
        JSON.stringify(p)
    );
    return `${url.pathname}-${sku}-${addProps}-pdpExtension`;
};
