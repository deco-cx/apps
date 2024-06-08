import type { AppContext } from '../mod.ts'
import { parseHeaders } from '../utils/parseHeaders.ts'
import type { CreateCheckoutMutation, CreateCheckoutMutationVariables } from '../utils/graphql/storefront.graphql.gen.ts'
import { CreateCheckout } from '../utils/graphql/queries.ts'

// https://wakecommerce.readme.io/docs/storefront-api-createcheckout
export default async function ({ products }: Props, req: Request, { storefront }: AppContext): Promise<string> {
    const headers = parseHeaders(req.headers)

    const { createCheckout } = await storefront.query<CreateCheckoutMutation, CreateCheckoutMutationVariables>(
        {
            variables: { products: products ?? [] },
            ...CreateCheckout,
        },
        { headers },
    )

    return createCheckout?.checkoutId ?? ''
}

interface Props {
    products?: {
        /**
         * ID do variante do produto
         */
        productVariantId: number
        /**
         * Quantidade do produto a ser adicionado
         */
        quantity: number
        /**
         * Personalizações do produto
         */
        customization?: {
            customizationId: number
            value: string
        }[]
        /**
         * Informações de assinatura
         */
        subscription?: {
            recurringTypeId: number
            subscriptionGroupId: number
        }
    }
}
