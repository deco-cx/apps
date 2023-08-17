import { setCookie } from "std/http/mod.ts";
import { AppContext } from "../../mod.ts";
import type { Cart } from "../../utils/client/types.ts";

export interface Props {
  itemId: string;
  quantity: number;
  attributes: Record<string, string>;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { client } = ctx;
  const { itemId, quantity, attributes } = props;
  const reqCookies = req.headers.get("cookie") ?? "";

  const { orderForm, cookies } = await client.carrinho.adicionar({
    cookie: reqCookies,
    sku: itemId,
    quantity,
    attributes,
  });

  // in case the cart was created, set the cookie to the browser
  for (const cookie of cookies) {
    setCookie(ctx.response.headers, {
      ...cookie,
      domain: new URL(req.url).hostname,
    });
  }

  const allCookies = [
    reqCookies,
    ...cookies.map(({ name, value }) => `${name}=${value}`),
  ].join("; ");

  const relatedItems = await client.carrinho.relatedItems(allCookies);

  return {
    orderForm,
    relatedItems,
  };
};

export default action;
