import { badRequest } from "@deco/deco";
import { HttpError } from "../../../utils/http.ts";
import type { AppContext } from "../../mod.ts";
import { getCartCookie, setCartCookie } from "../../utils/cart.ts";
import { AddCoupon } from "../../utils/graphql/queries.ts";
import type {
  AddCouponMutation,
  AddCouponMutationVariables,
  CheckoutFragment,
} from "../../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../../utils/parseHeaders.ts";
import ensureCustomerToken from "../../utils/ensureCustomerToken.ts";
import authenticate from "../../utils/authenticate.ts";

export interface Props {
  coupon: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Partial<CheckoutFragment>> => {
  const { storefront } = ctx;
  const cartId = getCartCookie(req.headers);
  const headers = parseHeaders(req.headers);
  const customerAccessToken = await authenticate(req, ctx);

  if (!cartId) {
    throw new HttpError(400, "Missing cart cookie");
  }

  try {
    const variables = { checkoutId: cartId, customerAccessToken, ...props };
    const data = await storefront.query<
      AddCouponMutation,
      AddCouponMutationVariables
    >(
      {
        variables,
        ...AddCoupon,
      },
      { headers },
    );

    const checkoutId = data.checkout?.checkoutId;

    if (cartId !== checkoutId) {
      setCartCookie(ctx.response.headers, checkoutId);
    }

    return data.checkout ?? {};
  } catch (errors: any) {
    throw badRequest(errors);
  }
};

export default action;
