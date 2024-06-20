import type { AppContext } from '../mod.ts'
import { parseHeaders } from '../utils/parseHeaders.ts'
import type { GetUserAddressesQuery, GetUserAddressesQueryVariables } from '../utils/graphql/storefront.graphql.gen.ts'
import { GetUserAddresses } from '../utils/graphql/queries.ts'
import authenticate from '../utils/authenticate.ts'
import ensureCustomerToken from '../utils/ensureCustomerToken.ts'
import nonNullable from '../utils/nonNullable.ts'

// https://wakecommerce.readme.io/docs/storefront-api-customer
export default async function (_props: object, req: Request, ctx: AppContext) {
    const headers = parseHeaders(req.headers)
    const customerAccessToken = ensureCustomerToken(await authenticate(req, ctx))

    if (!customerAccessToken) return []

    const { customer } = await ctx.storefront.query<GetUserAddressesQuery, GetUserAddressesQueryVariables>(
        {
            variables: { customerAccessToken },
            ...GetUserAddresses,
        },
        { headers },
    )

    return (customer?.addresses || []).filter(nonNullable)
}
