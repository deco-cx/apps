import { HttpError } from "../../../utils/http.ts";
import { AppContext } from "../../mod.ts";
import { getCartCookie, setCartCookie } from "../../utils/cart.ts";
import { CheckoutAddMetadata } from "../../utils/graphql/queries.ts";
import {
  CheckoutAddMetadataMutation,
  CheckoutAddMetadataMutationVariables,
  CheckoutFragment,
} from "../../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../../utils/parseHeaders.ts";

export interface Metadata {
  key: string;
  value: string;
}
export interface Props {
  metadata: Metadata[];
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Partial<CheckoutFragment>> => {
  const { storefront } = ctx;
  const cartId = getCartCookie(req.headers);
  const headers = parseHeaders(req.headers);

  if (!cartId) {
    throw new HttpError(400, "Missing cart cookie");
  }

  const data = await storefront.query<
    CheckoutAddMetadataMutation,
    CheckoutAddMetadataMutationVariables
  >({
    variables: { checkoutId: cartId, ...props },
    ...CheckoutAddMetadata,
  }, { headers });

  const checkoutId = data.checkout?.checkoutId;

  if (cartId !== checkoutId) {
    setCartCookie(ctx.response.headers, checkoutId);
  }

  return data.checkout ?? {};
};

export default action;
