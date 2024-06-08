import type { AppContext } from '../mod.ts'
import { parseHeaders } from '../utils/parseHeaders.ts'
import type {
    CheckoutCustomerAssociateMutation,
    CheckoutCustomerAssociateMutationVariables,
    CustomerAuthenticatedLoginMutation,
    CustomerAuthenticatedLoginMutationVariables,
} from '../utils/graphql/storefront.graphql.gen.ts'
import { CheckoutCustomerAssociate, CustomerAuthenticatedLogin } from '../utils/graphql/queries.ts'
import { getCookies, setCookie } from 'std/http/cookie.ts'

export default async function (
    props: Props,
    req: Request,
    { storefront, response }: AppContext,
): Promise<CustomerAuthenticatedLoginMutation['customerAuthenticatedLogin']> {
    const headers = parseHeaders(req.headers)

    const { customerAuthenticatedLogin } = await storefront.query<
        CustomerAuthenticatedLoginMutation,
        CustomerAuthenticatedLoginMutationVariables
    >({ variables: props, ...CustomerAuthenticatedLogin }, { headers })

    if (customerAuthenticatedLogin) {
        setCookie(response.headers, {
            name: 'customerAccessToken',
            path: '/',
            value: customerAuthenticatedLogin.token as string,
            expires: new Date(customerAuthenticatedLogin.validUntil),
        })
        setCookie(response.headers, {
            name: 'customerAccessTokenExpires',
            path: '/',
            value: customerAuthenticatedLogin.validUntil,
            expires: new Date(customerAuthenticatedLogin.validUntil),
        })

        // associate account to checkout
        await storefront.query<CheckoutCustomerAssociateMutation, CheckoutCustomerAssociateMutationVariables>(
            {
                variables: {
                    customerAccessToken: customerAuthenticatedLogin.token as string,
                    checkoutId: getCookies(req.headers).checkout,
                },
                ...CheckoutCustomerAssociate,
            },
            { headers },
        )
    }

    return customerAuthenticatedLogin
}

export interface Props {
    /**
     * Email
     */
    input: string
    /**
     * Senha
     */
    pass: string
}
