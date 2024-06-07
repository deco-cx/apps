import { AppContext } from "../mod.ts";
import { Wishlist } from "../utils/client/types.ts";
import { getUserCookie } from "../utils/user.ts";
import { SESSION_COOKIE } from "../utils/constants.ts";

export default async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Wishlist | null> {
  const { clientAdmin, site } = ctx;
  const id = getUserCookie(req.headers);
  const headers = new Headers({ Cookie: `${SESSION_COOKIE}=${id}` });
  const { wishlist } = await clientAdmin["GET /:site/customer/section/load"]({
    sections: "wishlist",
    site,
  }, { headers }).then((res) => res.json());

  if (!wishlist) return null;

  return wishlist;
}
