import type { AppContext } from "../mod.ts";
import { getCartCookie } from "../utils/cart.ts";
import ensureCheckout from "../utils/ensureCheckout.ts";
import { CheckoutSelectInstallment } from "../utils/graphql/queries.ts";
import type {
  CheckoutSelectInstallmentMutation,
  CheckoutSelectInstallmentMutationVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";

// https://wakecommerce.readme.io/docs/checkoutselectinstallment
export default async function (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CheckoutSelectInstallmentMutation["checkoutSelectInstallment"]> {
  const headers = parseHeaders(req.headers);
  const checkoutId = ensureCheckout(getCartCookie(req.headers));

  const { checkoutSelectInstallment } = await ctx.storefront.query<
    CheckoutSelectInstallmentMutation,
    CheckoutSelectInstallmentMutationVariables
  >(
    {
      variables: {
        installmentNumber: props.installmentNumber,
        selectedPaymentMethodId: props.selectedPaymentMethodId,
        checkoutId,
      },
      ...CheckoutSelectInstallment,
    },
    { headers },
  );

  return checkoutSelectInstallment;
}

interface Props {
  installmentNumber: number;
  selectedPaymentMethodId: string;
}
