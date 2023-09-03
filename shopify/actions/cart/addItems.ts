import { AppContext } from "../../mod.ts";
import { getCartCookie, setCartCookie } from "../../utils/cart.ts";
import { Data, query, Variables } from "../../utils/queries/addItem.ts";
import { Data as CartData } from "../../utils/queries/cart.ts";

type UpdateLineProps = {
  lines: {
    merchandiseId: string;
    attributes?: Array<{ key: string; value: string }>;
    quantity?: number;
    sellingPlanId?: string;
  };
};

const action = async (
  { lines }: UpdateLineProps,
  req: Request,
  ctx: AppContext,
): Promise<CartData["cart"]> => {
  const { storefront } = ctx;
  const cartId = getCartCookie(req.headers);

  if (!cartId) {
    throw new Error("Missing cart id");
  }

  const { payload: { cart } } = await storefront.query<Data, Variables>({
    variables: { cartId, lines },
    query,
  });

  setCartCookie(ctx.response.headers, cartId);

  return cart;
};

export default action;
