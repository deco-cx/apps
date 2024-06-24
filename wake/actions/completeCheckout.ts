import authenticate from "../utils/authenticate.ts";
import { getCartCookie } from "../utils/cart.ts";
import ensureCustomerToken from "../utils/ensureCustomerToken.ts";
import type { AppContext } from "../mod.ts";
import { CheckoutComplete } from "../utils/graphql/queries.ts";
import type {
  CheckoutCompleteMutation,
  CheckoutCompleteMutationVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";

// https://wakecommerce.readme.io/docs/checkoutcomplete
export default async function (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CheckoutCompleteMutation["checkoutComplete"]> {
  const headers = parseHeaders(req.headers);
  const customerAccessToken = ensureCustomerToken(await authenticate(req, ctx));
  const checkoutId = getCartCookie(req.headers);

  if (!customerAccessToken) return null;

  const { checkoutComplete } = await ctx.storefront.query<
    CheckoutCompleteMutation,
    CheckoutCompleteMutationVariables
  >(
    {
      variables: {
        paymentData: new URLSearchParams(props.paymentData).toString(),
        comments: props.comments,
        customerAccessToken,
        checkoutId,
      },
      ...CheckoutComplete,
    },
    { headers },
  );

  return checkoutComplete;
}

interface Props {
  /**
   * Informações adicionais de pagamento
   */
  paymentData?: Record<string, string>;
  /**
   * Comentários
   */
  comments?: string;
}
