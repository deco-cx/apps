import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { ExtensionProps } from "../../../utils/client/types.ts";
import { liveloCartExt } from "../../../utils/extension.ts";
import { Cart } from "../../cart.ts";

/**
 * @title Magento ExtensionOf Cart - Livelo Points
 * @description Add extra data to your loader. This may harm performance
 */
const loader = (
    props: ExtensionProps,
    _req: Request,
    ctx: AppContext,
): ExtensionOf<Cart | null> =>
async (page: Cart | null) => {
    if (!page) {
        return page;
    }

    if (props.active) {
        return await liveloCartExt(page, props.path, ctx);
    }
    return page;
};

export default loader;
