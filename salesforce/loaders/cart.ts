import { Basket } from "../utils/types.ts";
import { AppContext } from "../mod.ts";
import { getSession, getSessionCookie } from "../utils/session.ts";
import { getHeaders } from "../utils/transform.ts";
import getBasketImages from "../utils/product.ts";
import { proxySetCookie } from "../utils/cookies.ts";

/**
 * @title Salesforce - Get Cart
 */
export default async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Basket | null> {
  let session = getSession(ctx);

  if (!session) {
    session = getSessionCookie(req);
  }

  const { basketId, token } = session;
  const { slc, organizationId, siteId } = ctx;

  try {
    const response = await slc
      ["GET /checkout/shopper-baskets/v1/organizations/:organizationId/baskets/:basketId"](
        {
          organizationId,
          basketId: basketId!,
          siteId,
        },
        {
          headers: getHeaders(token!),
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
    const finalBasket = await getBasketImages(basket, productsBasketSku, ctx);

    return {
      ...finalBasket,
      locale: ctx.locale ?? "",
    };
  } catch (error) {
    console.error(error);

    throw error;
  }
}
