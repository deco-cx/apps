import { AppContext } from "../../mod.ts";
import type { Basket } from "../../utils/types.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { getSession } from "../../utils/session.ts";
import getBasketImages from "../../utils/product.ts";
import { getHeaders } from "../../utils/transform.ts";

export interface Props {
  text: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Basket> => {
  const { slc, organizationId } = ctx;
  const {
    text,
  } = props;

  const session = getSession(ctx);

  try {
    const response = await slc
      ["POST /checkout/shopper-baskets/v1/organizations/:organizationId/baskets/:basketId/coupons"](
        {
          organizationId,
          basketId: session.basketId!,
        },
        {
          body: { code: text, valid: true },
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
