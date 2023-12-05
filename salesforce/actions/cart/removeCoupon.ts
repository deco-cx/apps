import { AppContext } from "../../mod.ts";
import type { Basket } from "../../utils/types.ts";
import { getSession } from "../../utils/session.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import getBasketImages from "../../utils/product.ts";
import { getHeaders } from "../../utils/transform.ts";

export interface Props {
  basketId: string;
  couponItemId: string;
}
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Basket> => {
  const { slc, organizationId } = ctx;
  const session = getSession(ctx);

  const { couponItemId } = props;

  try {
    const response = await slc
      ["DELETE /checkout/shopper-baskets/v1/organizations/:organizationId/baskets/:basketId/coupons/:couponItemId"](
        {
          organizationId,
          basketId: session.basketId!,
          couponItemId,
        },
        {
          headers: getHeaders(session.token!),
        },
      );

    const basket = await response.json();

    const productsBasketSku: string[] = basket.productItems.map(
      (item: { productId: string }) => {
        return item.productId;
      },
    );
    proxySetCookie(response.headers, ctx.response.headers, req.url);

    return await getBasketImages(basket, productsBasketSku, ctx);
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export default action;
