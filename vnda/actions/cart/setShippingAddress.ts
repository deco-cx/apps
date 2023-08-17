import { AppContext } from "apps/vnda/mod.ts";
import type { Cart } from "apps/vnda/utils/client/types.ts";

export interface Props {
  zip: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { client } = ctx;
  const { zip } = props;

  const cookie = req.headers.get("cookie") ?? "";

  const shipping = await client.cep(zip, cookie);
  const updated = await ctx.invoke("apps/vnda/loaders/cart.ts");

  return { shipping, ...updated };
};

export default action;
