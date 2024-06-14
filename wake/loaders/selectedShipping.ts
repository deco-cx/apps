import authenticate from 'apps/wake/utils/authenticate.ts'
import { getCartCookie } from 'apps/wake/utils/cart.ts'
import ensureCustomerToken from 'apps/wake/utils/ensureCustomerToken.ts'
import type { AppContext } from '../mod.ts'
import { GetSelectedShipping } from '../utils/graphql/queries.ts'
import type {
    GetSelectedShippingQuery,
    GetSelectedShippingQueryVariables,
} from '../utils/graphql/storefront.graphql.gen.ts'
import { parseHeaders } from '../utils/parseHeaders.ts'

// https://wakecommerce.readme.io/docs/storefront-api-checkout
export default async function (
    props: object,
    req: Request,
    ctx: AppContext,
): Promise<NonNullable<GetSelectedShippingQuery['checkout']>['selectedShipping']> {
    const headers = parseHeaders(req.headers)
    const customerAccessToken = ensureCustomerToken(await authenticate(req, ctx))
    const checkoutId = getCartCookie(req.headers)

    if (!customerAccessToken || !checkoutId) return null

    const { checkout } = await ctx.storefront.query<GetSelectedShippingQuery, GetSelectedShippingQueryVariables>(
        {
            variables: {
                customerAccessToken,
                checkoutId,
            },
            ...GetSelectedShipping,
        },
        { headers },
    )

    return checkout?.selectedShipping ?? null
}
