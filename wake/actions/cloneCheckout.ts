import type { AppContext } from "../mod.ts";
import { getCartCookie, setCartCookie } from "../utils/cart.ts";
import ensureCheckout from "../utils/ensureCheckout.ts";
import { CheckoutClone } from "../utils/graphql/queries.ts";
import type {
  CheckoutCloneMutation,
  CheckoutCloneMutationVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";

// https://wakecommerce.readme.io/docs/storefront-api-checkoutclone
export default async function (props: object, req: Request, ctx: AppContext) {
  const headers = parseHeaders(req.headers);
  const checkoutId = ensureCheckout(getCartCookie(req.headers));

  const { checkoutClone } = await ctx.storefront.query<
    CheckoutCloneMutation,
    CheckoutCloneMutationVariables
  >(
    {
      variables: {
        checkoutId,
        copyUser: true,
      },
      ...CheckoutClone,
    },
    { headers },
  );

  const clonedCheckoutId = checkoutClone?.checkoutId;

  if (!clonedCheckoutId) {
    throw new Error("Could not clone checkout");
  }

  setCartCookie(ctx.response.headers, clonedCheckoutId);
}
