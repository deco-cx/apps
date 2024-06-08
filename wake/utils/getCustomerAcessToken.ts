import { getCookies } from 'std/http/cookie.ts'

export default function (req: Request) {
    const tokenExpires = getCookies(req.headers).customerAccessTokenExpires ?? ''

    // if token expired
    if (tokenExpires && new Date(tokenExpires) < new Date()) {
        throw new Error('Token expired')
    }

    return getCookies(req.headers).customerAccessToken
}
