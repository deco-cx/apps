import { AppContext } from "apps/vnda/mod.ts";
import type { Cart } from "apps/vnda/utils/client/types.ts";

/**
 * @title VNDA Integration
 * @description Cart loader
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { client } = ctx;
  const cookies = req.headers.get("cookie") ?? "";

  const [orderForm, relatedItems] = await Promise.all([
    client.carrinho.get(cookies),
    client.carrinho.relatedItems(cookies),
  ]);

  return {
    orderForm,
    relatedItems,
  };
};

export default loader;
