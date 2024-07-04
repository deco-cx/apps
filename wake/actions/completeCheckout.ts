import { deleteCookie, setCookie } from "std/http/cookie.ts";
import type { AppContext } from "../mod.ts";
import authenticate from "../utils/authenticate.ts";
import { CART_COOKIE, getCartCookie } from "../utils/cart.ts";
import ensureCustomerToken from "../utils/ensureCustomerToken.ts";
import { CheckoutComplete } from "../utils/graphql/queries.ts";
import type {
  CheckoutCompleteMutation,
  CheckoutCompleteMutationVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import ensureCheckout from "../utils/ensureCheckout.ts";

// https://wakecommerce.readme.io/docs/checkoutcomplete
export default async function (props: Props, req: Request, ctx: AppContext) {
  const headers = parseHeaders(req.headers);
  const customerAccessToken = ensureCustomerToken(await authenticate(req, ctx));
  const checkoutId = ensureCheckout(getCartCookie(req.headers));

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

  deleteCookie(ctx.response.headers, CART_COOKIE, { path: "/" });
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
