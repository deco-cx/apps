import type { AppContext } from "../../mod.ts";
import { getUserCookie, SESSION_COOKIE } from "../../utils/user.ts";
import { Wishlist } from "../../utils/client/types.ts";

export interface Props {
  productId: string;
}
const action = async (
  { productId }: Props,
  req: Request,
  ctx: AppContext,
): Promise<Wishlist | null> => {
  try {
    const { clientAdmin, site } = ctx;
    const id = getUserCookie(req.headers);
    const headers = new Headers({ Cookie: `${SESSION_COOKIE}=${id}` });
    const { success } = await clientAdmin["POST /:site/wishlist/index/add/"]({
      site,
    }, {
      body: { product: productId },
      headers,
    }).then((res) => res.json());
    if (success) return ctx.invoke("magento/loaders/wishlist.ts");
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default action;
