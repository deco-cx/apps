import authenticate from 'apps/wake/utils/authenticate.ts'
import { getCartCookie } from 'apps/wake/utils/cart.ts'
import ensureCustomerToken from 'apps/wake/utils/ensureCustomerToken.ts'
import type { AppContext } from '../mod.ts'
import { GetSelectedAddress } from '../utils/graphql/queries.ts'
import type {
    GetSelectedAddressQuery,
    GetSelectedAddressQueryVariables,
} from '../utils/graphql/storefront.graphql.gen.ts'
import { parseHeaders } from '../utils/parseHeaders.ts'

// https://wakecommerce.readme.io/docs/storefront-api-checkout
export default async function (
    props: object,
    req: Request,
    ctx: AppContext,
): Promise<NonNullable<GetSelectedAddressQuery['checkout']>['selectedAddress']> {
    const headers = parseHeaders(req.headers)
    const customerAccessToken = ensureCustomerToken(await authenticate(req, ctx))
    const checkoutId = getCartCookie(req.headers)

    if (!customerAccessToken || !checkoutId) return null

    const { checkout } = await ctx.storefront.query<GetSelectedAddressQuery, GetSelectedAddressQueryVariables>(
        {
            variables: {
                customerAccessToken,
                checkoutId,
            },
            ...GetSelectedAddress,
        },
        { headers },
    )

    return checkout?.selectedAddress ?? null
}
