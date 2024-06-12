import type { AppContext } from '../mod.ts'
import { parseHeaders } from '../utils/parseHeaders.ts'
import type {
    CustomerAddressUpdateMutation,
    CustomerAddressUpdateMutationVariables,
} from '../utils/graphql/storefront.graphql.gen.ts'
import { CustomerAddressUpdate } from '../utils/graphql/queries.ts'
import authenticate from 'apps/wake/utils/authenticate.ts'
import ensureCustomerToken from 'apps/wake/utils/ensureCustomerToken.ts'

// https://wakecommerce.readme.io/docs/customeraddressupdate
export default async function (
    props: Props,
    req: Request,
    ctx: AppContext,
): Promise<CustomerAddressUpdateMutation['customerAddressUpdate']> {
    const headers = parseHeaders(req.headers)
    const customerAccessToken = ensureCustomerToken(await authenticate(req, ctx))

    const { customerAddressUpdate } = await ctx.storefront.query<
        CustomerAddressUpdateMutation,
        CustomerAddressUpdateMutationVariables
    >(
        {
            variables: {
                address: props.address,
                id: props.addressId,
                customerAccessToken,
            },
            ...CustomerAddressUpdate,
        },
        { headers },
    )

    return customerAddressUpdate
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
