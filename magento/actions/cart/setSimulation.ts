import { AppContext } from "../../mod.ts";
import { getCartCookie } from "../../utils/cart.ts";
import { SetShipping } from "../../utils/client/types.ts";
import { getUserCookie, SESSION_COOKIE } from "../../utils/user.ts";

export type Props = Omit<SetShipping, "isLoggedIn" | "quoteId" | "countryId">;

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
) => {
  const { clientAdmin, site } = ctx;

  const id = getUserCookie(req.headers);
  const cartId = getCartCookie(req.headers);

  const { cart } = await clientAdmin["GET /:site/customer/section/load"]({
    site,
    sections: "cart",
  }, { headers: new Headers({ Cookie: `${SESSION_COOKIE}=${id}` }) }).then((
    res,
  ) => res.json());

  const isLoggedIn = cart?.minicart_improvements?.is_logged_in ?? false;
  const quoteId = cartId ?? "";
  const countryId = cart?.minicart_improvements?.country_id ?? "BR";

  return clientAdmin
    ["POST /:site/rest/:site2/V1/digitalhub/set-shipping-to-quote"]({
      site,
      site2: site,
    }, {
      headers: new Headers({ Cookie: `${SESSION_COOKIE}=${id}` }),
      body: { ...props, isLoggedIn, quoteId, countryId },
    });
};

export default action;
