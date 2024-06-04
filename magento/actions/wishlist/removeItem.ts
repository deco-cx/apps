import type { AppContext } from "../../mod.ts";
import { getUserCookie, SESSION_COOKIE } from "../../utils/user.ts";
import { ITEM_NOT_FOUND, ITEM_REMOVE } from "../../utils/constants.ts";

export interface Props {
  itemId: string;
}
const action = async (
  { itemId }: Props,
  req: Request,
  ctx: AppContext,
): Promise<typeof ITEM_REMOVE | typeof ITEM_NOT_FOUND> => {
  try {
    const { clientAdmin, site } = ctx;
    const id = getUserCookie(req.headers);
    const headers = new Headers({ Cookie: `${SESSION_COOKIE}=${id}` });
    const { success } = await clientAdmin["POST /:site/wishlist/index/add/"]({
      site,
    }, {
      body: { product: itemId },
      headers,
    }).then((res) => res.json());
    if (success) return ITEM_REMOVE;

    return ITEM_NOT_FOUND;
  } catch (error) {
    console.log(error);
    return ITEM_NOT_FOUND;
  }
};

export default action;
