import type { AppContext } from '../mod.ts'
import { parseHeaders } from '../utils/parseHeaders.ts'
import type { GetUserAddressesQuery, GetUserAddressesQueryVariables } from '../utils/graphql/storefront.graphql.gen.ts'
import { GetUserAddresses } from '../utils/graphql/queries.ts'
import getCustomerAcessToken from '../utils/getCustomerAcessToken.ts'

// https://wakecommerce.readme.io/docs/storefront-api-customer
export default async function (
    _props: object,
    req: Request,
    { storefront }: AppContext,
): Promise<NonNullable<NonNullable<GetUserAddressesQuery['customer']>['addresses']>> {
    const headers = parseHeaders(req.headers)

    const { customer } = await storefront.query<GetUserAddressesQuery, GetUserAddressesQueryVariables>(
        {
            variables: { customerAccessToken: getCustomerAcessToken(req) },
            ...GetUserAddresses,
        },
        { headers },
    )

    return customer?.addresses || []
}
