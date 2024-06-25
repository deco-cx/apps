import type { AppContext } from '../mod.ts'
import { GetProductCustomizations } from '../utils/graphql/queries.ts'
import type {
    GetProductCustomizationsQuery,
    GetProductCustomizationsQueryVariables,
} from '../utils/graphql/storefront.graphql.gen.ts'
import { parseHeaders } from '../utils/parseHeaders.ts'

// https://wakecommerce.readme.io/docs/storefront-api-product
export default async function (props: Props, req: Request, ctx: AppContext) {
    const headers = parseHeaders(req.headers)

    const { product } = await ctx.storefront.query<
        GetProductCustomizationsQuery,
        GetProductCustomizationsQueryVariables
    >(
        {
            variables: { productId: props.productId },
            ...GetProductCustomizations,
        },
        { headers },
    )

    return product
}

interface Props {
    productId: number
}
