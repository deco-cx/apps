import type { AppContext } from "../mod.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import type {
  CreateCheckoutMutation,
  CreateCheckoutMutationVariables,
} from "../graphql/storefront.graphql.gen.ts";
import { CustomerAddressRemove } from "../graphql/queries.ts";

// https://wakecommerce.readme.io/docs/storefront-api-createcheckout
export default async function (
  { products }: Props,
  req: Request,
  { storefront }: AppContext,
): Promise<CreateCheckoutMutation["createCheckout"]> {
  const headers = parseHeaders(req.headers);

  const { createCheckout } = await storefront.query<
    CreateCheckoutMutation,
    CreateCheckoutMutationVariables
  >(
    {
      variables: { products: products ?? [] },
      ...CustomerAddressRemove,
    },
    { headers },
  );

  return createCheckout;
}

interface Props {
  products?: {
    /**
     * ID do variante do produto
     */
    productVariantId: number;
    /**
     * Quantidade do produto a ser adicionado
     */
    quantity: number;
    /**
     * Personalizações do produto
     */
    customization?: {
      customizationId: number;
      value: string;
    }[];
    /**
     * Informações de assinatura
     */
    subscription?: {
      recurringTypeId: number;
      subscriptionGroupId: number;
    };
  };
}
