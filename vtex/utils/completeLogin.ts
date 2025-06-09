import { setCookie } from "std/http/cookie.ts";
import { AuthResponse } from "./types.ts";
import { AppContext } from "../mod.ts";

export default async function completeLogin(
    data: AuthResponse,
    ctx: AppContext,
) {
    //const cookies = getSetCookies(headers);

    if (data.authStatus === "Success") {
        const VTEXID_EXPIRES = data.expiresIn;

        if (data.authCookie) {
            setCookie(ctx.response.headers, {
                name: data.authCookie.Name,
                value: data.authCookie.Value,
                httpOnly: true,
                maxAge: VTEXID_EXPIRES,
                path: "/",
                secure: true,
            });
        }

        if (data.accountAuthCookie) {
            setCookie(ctx.response.headers, {
                name: data.accountAuthCookie.Name,
                value: data.accountAuthCookie.Value,
                httpOnly: true,
                maxAge: VTEXID_EXPIRES,
                path: "/",
                secure: true,
            });
        }
    }

    await ctx.invoke.vtex.actions.session.editSession({});
}
