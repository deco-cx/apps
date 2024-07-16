import { ProductDetailsPage } from "../../../../../commerce/types.ts";
import { ExtensionOf } from "../../../../../website/loaders/extension.ts";
import { AppContext } from "../../../../mod.ts";
import { ExtensionProps } from "../../../../utils/client/types.ts";
import { reviewsExt } from "../../../../utils/extension.ts";

export const cache = "stale-while-revalidate";

export const cacheKey = (
    props: ExtensionProps,
    req: Request,
    _ctx: AppContext,
) => {
    const url = new URL(req.url);
    return `${url.hostname}${url.pathname}-pdp-reviews:${props.active}-url:${props.path}`;
};

/**
 * @title Magento ExtensionOf Details Page - Amasty Reviews
 * @description Add extra data to your loader. This may harm performance
 */
const loader = (
    props: ExtensionProps,
    _req: Request,
    ctx: AppContext,
): ExtensionOf<ProductDetailsPage | null> =>
async (page: ProductDetailsPage | null) => {
    if (!page) {
        return page;
    }

    if (props.active) {
        const product = await reviewsExt([page.product], props.path, ctx);

        return {
            ...page,
            product: product[0],
        };
    }
    return page;
};

export default loader;
