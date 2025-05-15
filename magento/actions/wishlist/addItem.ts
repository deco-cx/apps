import type { AppContext } from "../../mod.ts";
import { getUserCookie } from "../../utils/user.ts";
import { Wishlist } from "../../utils/client/types.ts";
import wishlistLoader from "../../loaders/wishlist.ts";
import { SESSION_COOKIE } from "../../utils/constants.ts";
import { getCookies } from "std/http/cookie.ts";
export interface Props {
  productId: string;
}
/**
 * @title Magento Integration - Add item to Wishlist
 * @description Add to wishlist action
 */
const action = async (
  { productId }: Props,
  req: Request,
  ctx: AppContext,
): Promise<Wishlist | null> => {
  try {
    const { clientAdmin, site } = ctx;
    const id = getUserCookie(req.headers);
    const form_key = getCookies(req.headers)["form_key"];

    const headers = new Headers({
      Cookie: `${SESSION_COOKIE}=${id}`,
      "x-requested-with": "XMLHttpRequest",
    });
    const body = new FormData();
    body.append("product", productId);
    body.append("form_key", form_key);

    const { success } = await clientAdmin["POST /:site/wishlist/index/add/"]({
      site,
    }, {
      body,
      headers,
    }).then((res) => res.json());

    if (success) return wishlistLoader(null, req, ctx);
    return null;
  } catch (_error) {
    return null;
  }
};

export default action;
