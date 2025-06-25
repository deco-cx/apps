import { getCookies } from "std/http/cookie.ts";
import { AppContext } from "../../mod.ts";
import getLoginCookies from "../../utils/login/getLoginCookies.ts";

interface Props {
    fingerprint?: string;
}

export default async function refreshToken(
    props: Props,
    req: Request,
    ctx: AppContext,
) {
    const { fingerprint } = props;
    const { vcsDeprecated } = ctx;
    const cookies = getLoginCookies({ cookies: getCookies(req.headers) });

    const response = await vcsDeprecated
        ["POST /api/vtexid/refreshtoken/webstore"]({}, {
            body: {
                fingerprint,
            },
            headers: {
                cookie: Object.entries(cookies)
                    .map(([name, value]) => `${name}=${value}`)
                    .join("; "),
            },
        });

    if (!response.ok) {
        throw new Error(
            `Authentication request failed: ${response.status} ${response.statusText}`,
        );
    }

    const data = await response.json();
    return data;
}
