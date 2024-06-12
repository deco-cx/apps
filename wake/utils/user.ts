import { getCookies, setCookie } from 'std/http/cookie.ts'

export const LOGIN_COOKIE = 'fbits-login'

const _1_YEAR = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)

export const getUserCookie = (headers: Headers): string | undefined => {
    const cookies = getCookies(headers)

    return cookies[LOGIN_COOKIE]
}

export const setUserCookie = (headers: Headers, token: string, expires: Date): void => {
    setCookie(headers, {
        name: 'customerToken',
        path: '/',
        value: token as string,
        expires: _1_YEAR,
    })
    setCookie(headers, {
        name: 'customerTokenHasNOTexpired',
        path: '/',
        value: '_',
        expires,
    })
}
