import { STALE as DecoStale } from "../../../utils/fetch.ts";
import { AppContext } from "../../mod.ts";
import {
    ProductImagesInputs,
    ProductWithImagesGraphQL,
} from "../../utils/clientGraphql/types.ts";
import { CartFromAPI } from "../../utils/client/types.ts";
import { GetProductImages } from "../../utils/clientGraphql/queries.ts";

export interface Props {
    cart: CartFromAPI;
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, _req: Request, _ctx: AppContext) => {
    const stringifiedArray = props.cart.items.map(({ images }) =>
        images?.map((media) => JSON.stringify(media) ?? "").join("|")
    ).join("&");
    return stringifiedArray;
};

/**
 * @title Magento Integration - Product Details Page in GraphQL
 * @description Product Details Page loader
 */
async function loader(
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<ProductWithImagesGraphQL> {
    const { clientGraphql, enableCache } = ctx;
    const { cart } = props;
    const STALE = enableCache ? DecoStale : undefined;
    const response = await clientGraphql.query<
        ProductWithImagesGraphQL,
        ProductImagesInputs
    >(
        {
            variables: {
                filter: { sku: { in: cart.items.map(({ sku }) => sku) } },
                pageSize: cart.items.length,
            },
            ...GetProductImages,
        },
        STALE,
    ).catch((error) => {
        console.log(error);
        return ({
            products: {
                items: [],
            },
        });
    });

    return response;
}

export default loader;
