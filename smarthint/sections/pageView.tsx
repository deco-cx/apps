import { AppContext } from "../mod.ts";
import { getCookie, getData, setCookies } from "../utils/Tracking.ts"
import { diffInSeconds } from "../utils/segment.ts"

export interface Props {
    pageType: "category" |
    "search" |
    "searchWithResult" |
    "home" |
    "cart" |
    "emptycart" |
    "checkout" |
    "notfound" |
    "product" |
    "other"
}

export async function loader ({ pageType }: Props, req: Request, ctx: AppContext,) {
    const smarthint_anonymous_consumer = getCookie("smarthint_anonymous_consumer", req.headers) as string
    const smarthint_session = getCookie("smarthint_session", req.headers) as string
    const smarthint_timestamp = getCookie("smarthint_timestamp", req.headers)
    const smarthint_origin = getCookie("smarthint_origin", req.headers)

    const { api } = ctx;
    await  api["GET /track/pageView"]({
        anonymousConsumer: smarthint_anonymous_consumer, 
        session: smarthint_session, 
        shcode: ctx.shcode,
        url: req.url,
        date: getData(),
        pageType: pageType,
        elapsedTime: diffInSeconds(Number(smarthint_timestamp)),
        origin: smarthint_origin ??  req.url,
    })

    setCookies("smarthint_origin", req.url, req.headers)
}

export default function pageView () {
    return null
}