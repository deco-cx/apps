import { getCartCookie } from 'apps/wake/utils/cart.ts'
import type { AppContext } from '../mod.ts'
import { PaymentMethods } from '../utils/graphql/queries.ts'
import type { PaymentMethodsQuery, PaymentMethodsQueryVariables } from '../utils/graphql/storefront.graphql.gen.ts'
import { parseHeaders } from '../utils/parseHeaders.ts'

// https://wakecommerce.readme.io/docs/paymentmethods
export default async function (_props: object, req: Request, ctx: AppContext) {
    const headers = parseHeaders(req.headers)
    const checkoutId = getCartCookie(req.headers)

    const { paymentMethods } = await ctx.storefront.query<PaymentMethodsQuery, PaymentMethodsQueryVariables>(
        {
            variables: { checkoutId },
            ...PaymentMethods,
        },
        { headers },
    )

    return paymentMethods?.filter((i): i is NonNullable<typeof i> => !!i) || []
}
