import type { AppContext } from "../../mod.ts";
import { getUserCookie, SESSION_COOKIE } from "../../utils/user.ts";
import { ITEM_ADD, ITEM_NOT_FOUND } from "../../utils/constants.ts";

export interface Props {
  productId: string;
}
const action = async (
  { productId }: Props,
  req: Request,
  ctx: AppContext,
): Promise<typeof ITEM_NOT_FOUND | typeof ITEM_ADD> => {
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
    if (success) return ITEM_ADD;
    return ITEM_NOT_FOUND;
  } catch (error) {
    console.log(error);
    return ITEM_NOT_FOUND;
  }
};

export default action;
