import { getCookies, setCookie } from 'std/http/cookie.ts'
import type { AppContext } from '../mod.ts'

export default async function (req: Request, ctx: AppContext) {
    let checkoutCookie = getCookies(req.headers).checkout

    if (!checkoutCookie) {
        checkoutCookie = await ctx.invoke.checkout.actions.createCheckout()

        const _30days = 1000 * 60 * 60 * 24 * 30

        setCookie(ctx.response.headers, {
            name: 'checkout',
            value: checkoutCookie,
            path: '/',
            expires: new Date(Date.now() + _30days),
        })

    }

    return checkoutCookie
}
