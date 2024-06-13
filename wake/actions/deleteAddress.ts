import type { AppContext } from '../mod.ts'
import { parseHeaders } from '../utils/parseHeaders.ts'
import type {
    CustomerAddressRemoveMutation,
    CustomerAddressRemoveMutationVariables,
} from '../utils/graphql/storefront.graphql.gen.ts'
import { CustomerAddressRemove } from '../utils/graphql/queries.ts'
import authenticate from 'apps/wake/utils/authenticate.ts'
import ensureCustomerToken from 'apps/wake/utils/ensureCustomerToken.ts'

// https://wakecommerce.readme.io/docs/customeraddressremove
export default async function (
    props: Props,
    req: Request,
    ctx: AppContext,
): Promise<CustomerAddressRemoveMutation['customerAddressRemove']> {
    const headers = parseHeaders(req.headers)
    const customerAccessToken = ensureCustomerToken(await authenticate(req, ctx))

    if (!customerAccessToken) return null

    const { customerAddressRemove } = await ctx.storefront.query<
        CustomerAddressRemoveMutation,
        CustomerAddressRemoveMutationVariables
    >(
        {
            variables: {
                id: props.addressId,
                customerAccessToken,
            },
            ...CustomerAddressRemove,
        },
        { headers },
    )

    return customerAddressRemove
}

interface Props {
    /**
     * ID do endereço
     */
    addressId: string
    address: {
        /**
         * Detalhes do endereço
         */
        addressDetails?: string
        /**
         * Número do endereço
         */
        addressNumber?: string
        /**
         * Cep do endereço
         */
        cep?: string
        /**
         * Cidade do endereço
         */
        city?: string
        /**
         * País do endereço, ex. BR
         */
        country?: string
        /**
         * E-mail do usuário
         */
        email?: string
        /**
         * Nome do usuário
         */
        name?: string
        /**
         * Bairro do endereço
         */
        neighborhood?: string
        /**
         * Telefone do usuário
         */
        phone?: string
        /**
         * Ponto de referência do endereço
         */
        referencePoint?: string
        /**
         * Estado do endereço
         */
        state?: string
        /**
         * Rua do endereço
         */
        street?: string
    }
}
