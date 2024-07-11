import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { ExtensionProps } from "../../../utils/client/types.ts";
import { liveloCartExt } from "../../../utils/extension.ts";
import { Cart } from "../../cart.ts";

interface Props {
    liveloPoints: ExtensionProps;
}

/**
 * @title Magento ExtensionOf - Cart
 * @description Add extra data to your loader. This may harm performance
 */
const loader = (
    { liveloPoints }: Props,
    _req: Request,
    ctx: AppContext,
): ExtensionOf<Cart | null> =>
async (page: Cart | null) => {
    if (!page) {
        return page;
    }

    if (liveloPoints.active) {
        return await liveloCartExt(page, liveloPoints.path, ctx);
    }
    return page;
};

export default loader;
