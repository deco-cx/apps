import productListingPage from "../../loaders/ProductListingPage.ts";
import { AppContext } from "../../mod.ts";


export interface Props {
    nextPage: string;
    count: number;
}

export default async function ShowMore(props: Props, req: Request, ctx: AppContext){

    const response = await productListingPage({count: props.count}, new Request(props.nextPage || req.url, { headers: req.headers }), ctx)

    return response
}