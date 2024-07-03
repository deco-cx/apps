import { AppContext } from "../../../mod.ts";
import { Product } from "../../../../commerce/types.ts";
import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { liveloExt, reviewsExt } from "../../../utils/extensionsUtils.ts";
import { ExtensionProps } from "../../../utils/client/types.ts";

export interface Props {
    reviews?: ExtensionProps;
    liveloPoints?: ExtensionProps;
}

/**
 * @title Magento Extension - Product List
 * @description Add extra data to your loader. This may harm performance
 */
const loader = (
    { reviews, liveloPoints }: Props,
    _req: Request,
    ctx: AppContext,
): ExtensionOf<Product[] | null> =>
async (products: Product[] | null) => {
    if (!products || !Array.isArray(products)) {
        return products;
    }

    let p = products;

    if (reviews?.active) {
        p = await reviewsExt(p, reviews.path, ctx);
    }

    if (liveloPoints?.active) {
        p = await liveloExt(p, liveloPoints.path, ctx);
    }

    return p;
};

export default loader;
