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
 * @title Magento Integration - Remove item from Wishlist
 * @description Remove from wishlist action
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
      "Content-Type": "application/x-www-form-urlencoded",
    });
    const body = new FormData();
    body.append("item", productId);
    body.append("uenc", "");
    body.append("form_key", form_key);

    const { success } = await clientAdmin["POST /:site/wishlist/index/remove/"](
      {
        site,
      },
      {
        body,
        headers,
      },
    ).then((res) => res.json());

    if (success) return wishlistLoader(null, req, ctx);

    return null;
  } catch (error) {
    console.log("REMOVE", error);
    return null;
  }
};

export default action;
