import { getCartCookie } from "../utils/cart.ts";
import type { AppContext } from "../mod.ts";
import { CheckoutSelectPaymentMethod } from "../utils/graphql/queries.ts";
import type {
  CheckoutSelectPaymentMethodMutation,
  CheckoutSelectPaymentMethodMutationVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";

// https://wakecommerce.readme.io/docs/checkoutselectpaymentmethod
export default async function (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CheckoutSelectPaymentMethodMutation["checkoutSelectPaymentMethod"]> {
  const headers = parseHeaders(req.headers);
  const checkoutId = getCartCookie(req.headers);

  const { checkoutSelectPaymentMethod } = await ctx.storefront.query<
    CheckoutSelectPaymentMethodMutation,
    CheckoutSelectPaymentMethodMutationVariables
  >(
    {
      variables: {
        paymentMethodId: props.paymentMethodId,
        checkoutId,
      },
      ...CheckoutSelectPaymentMethod,
    },
    { headers },
  );

  return checkoutSelectPaymentMethod;
}

interface Props {
  paymentMethodId: string;
}
