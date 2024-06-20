import type { AppContext } from '../mod.ts'
import { parseHeaders } from '../utils/parseHeaders.ts'
import type {
    CheckoutAddressAssociateMutation,
    CheckoutAddressAssociateMutationVariables,
} from '../utils/graphql/storefront.graphql.gen.ts'
import { CheckoutAddressAssociate } from '../utils/graphql/queries.ts'
import authenticate from '../utils/authenticate.ts'
import ensureCustomerToken from '../utils/ensureCustomerToken.ts'
import { getCartCookie } from '../utils/cart.ts'

// https://wakecommerce.readme.io/docs/storefront-api-checkoutaddressassociate
export default async function (
    props: Props,
    req: Request,
    ctx: AppContext,
): Promise<CheckoutAddressAssociateMutation['checkoutAddressAssociate']> {
    const headers = parseHeaders(req.headers)
    const customerAccessToken = ensureCustomerToken(await authenticate(req, ctx))
    const checkoutId = getCartCookie(req.headers)

    if (!customerAccessToken) return null

    await ctx.storefront.query<CheckoutAddressAssociateMutation, CheckoutAddressAssociateMutationVariables>(
        {
            variables: {
                addressId: props.addressId,
                customerAccessToken,
                checkoutId,
            },
            ...CheckoutAddressAssociate,
        },
        { headers },
    )
}

interface Props {
    /**
     * ID do endereço
     */
    addressId: string
}
