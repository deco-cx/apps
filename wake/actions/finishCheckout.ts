import authenticate from 'apps/wake/utils/authenticate.ts'
import { getCartCookie } from 'apps/wake/utils/cart.ts'
import ensureCustomerToken from 'apps/wake/utils/ensureCustomerToken.ts'
import type { AppContext } from '../mod.ts'
import { CheckoutAddressAssociate } from '../utils/graphql/queries.ts'
import type {
    CheckoutCompleteMutation,
    CheckoutCompleteMutationVariables,
} from '../utils/graphql/storefront.graphql.gen.ts'
import { parseHeaders } from '../utils/parseHeaders.ts'

// https://wakecommerce.readme.io/docs/checkoutcomplete
export default async function (
    props: Props,
    req: Request,
    ctx: AppContext,
): Promise<CheckoutCompleteMutation['checkoutComplete']> {
    const headers = parseHeaders(req.headers)
    const customerAccessToken = ensureCustomerToken(await authenticate(req, ctx))
    const checkoutId = getCartCookie(req.headers)

    if (!customerAccessToken) return null

    const { checkoutComplete } = await ctx.storefront.query<
        CheckoutCompleteMutation,
        CheckoutCompleteMutationVariables
    >(
        {
            variables: {
                paymentData: props.paymentData,
                comments: props.comments,
                customerAccessToken,
                checkoutId,
            },
            ...CheckoutAddressAssociate,
        },
        { headers },
    )

    return checkoutComplete
}

interface Props {
    /**
     * Informações adicionais de pagamento
     */
    paymentData: string
    /**
     * Comentários
     */
    comments?: string
}
