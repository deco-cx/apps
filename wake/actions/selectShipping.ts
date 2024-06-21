import { getCartCookie } from "../utils/cart.ts";
import type { AppContext } from "../mod.ts";
import { CheckoutSelectShippingQuote } from "../utils/graphql/queries.ts";
import type {
  CheckoutSelectShippingQuoteMutation,
  CheckoutSelectShippingQuoteMutationVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";

// https://wakecommerce.readme.io/docs/storefront-api-checkoutselectshippingquote
export default async function (props: Props, req: Request, ctx: AppContext) {
  const headers = parseHeaders(req.headers);
  const checkoutId = getCartCookie(req.headers);

  await ctx.storefront.query<
    CheckoutSelectShippingQuoteMutation,
    CheckoutSelectShippingQuoteMutationVariables
  >(
    {
      variables: {
        shippingQuoteId: props.shippingQuoteId,
        checkoutId,
      },
      ...CheckoutSelectShippingQuote,
    },
    { headers },
  );
}

interface Props {
  shippingQuoteId: string;
}
