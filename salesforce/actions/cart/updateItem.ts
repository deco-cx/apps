import { AppContext } from "../../mod.ts";
import type { Basket } from "../../utils/types.ts";
import { getSession } from "../../utils/session.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import getBasketImages from "../../utils/product.ts";
import { getHeaders } from "../../utils/transform.ts";

export interface Props {
  quantity: number;
  itemId: string;
}
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Basket> => {
  const { slc, organizationId, siteId } = ctx;
  const session = getSession(ctx);

  const { itemId, quantity } = props;
  try {
    const path = quantity > 0 ? "PATCH" : "DELETE";
    const body = quantity > 0 ? { quantity: quantity } : {};

    const response = await slc
      [`${path} /checkout/shopper-baskets/v1/organizations/:organizationId/baskets/:basketId/items/:itemId`](
        {
          organizationId,
          basketId: session.basketId!,
          itemId,
          siteId: siteId,
        },
        {
          body: body,
          headers: getHeaders(session.token!),
        },
      );

    const basket = await response.json();

    const productsBasketSku: string[] = basket.productItems?.map(
      (item: { productId: string }) => {
        return item.productId;
      },
    );
    proxySetCookie(response.headers, ctx.response.headers, req.url);
    if (!productsBasketSku) {
      return { ...basket, productItems: [] };
    }

    return await getBasketImages(basket, productsBasketSku, ctx);
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export default action;
