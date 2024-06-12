import type { AppContext } from '../mod.ts'
import { deleteCookie } from 'std/http/cookie.ts'
import { CART_COOKIE } from 'apps/wake/utils/cart.ts'

export default function (_props: object, _req: Request, { response }: AppContext) {
    deleteCookie(response.headers, 'customerToken')
    deleteCookie(response.headers, 'customerTokenExpires')
    deleteCookie(response.headers, CART_COOKIE)
}
