import { getCookies } from 'std/http/cookie.ts'
import type { AppContext } from '../mod.ts'
import { getUserCookie, setUserCookie } from '../utils/user.ts'
import type {
    CustomerAccessTokenRenewMutation,
    CustomerAccessTokenRenewMutationVariables,
} from 'apps/wake/utils/graphql/storefront.graphql.gen.ts'
import { CustomerAccessTokenRenew } from 'apps/wake/utils/graphql/queries.ts'
import { parseHeaders } from 'apps/wake/utils/parseHeaders.ts'

const authenticate = async (req: Request, ctx: AppContext): Promise<string | null> => {
    const { checkoutApi, useCustomCheckout } = ctx

    if (useCustomCheckout) {
        const headers = parseHeaders(req.headers)
        const cookies = getCookies(req.headers)
        const customerToken = cookies.customerToken

        if (!customerToken) return null

        const { customerAccessTokenRenew } = await ctx.storefront.query<
            CustomerAccessTokenRenewMutation,
            CustomerAccessTokenRenewMutationVariables
        >(
            {
                variables: { customerAccessToken: customerToken },
                ...CustomerAccessTokenRenew,
            },
            { headers },
        )

        if (!customerAccessTokenRenew) return null

        const newCustomerToken = customerAccessTokenRenew.token
        if (!newCustomerToken) return null

        setUserCookie(ctx.response.headers, newCustomerToken, new Date(customerAccessTokenRenew.validUntil))
        return newCustomerToken
    }

    const loginCookie = getUserCookie(req.headers)
    if (!loginCookie) return null

    if (useCustomCheckout) return loginCookie

    const data = await checkoutApi['GET /api/Login/Get'](
        {},
        {
            headers: req.headers,
        },
    ).then(r => r.json())
    if (!data?.CustomerAccessToken) return null

    return data?.CustomerAccessToken
}

export default authenticate
