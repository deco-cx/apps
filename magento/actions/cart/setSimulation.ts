import cart from "../../loaders/cart.ts";
import { AppContext } from "../../mod.ts";
import { getCartCookie } from "../../utils/cart.ts";
import { Cart, SetShipping } from "../../utils/client/types.ts";
import { COUNTRY_ID, SESSION_COOKIE } from "../../utils/constants.ts";
import { getUserCookie } from "../../utils/user.ts";

export type Props = Omit<SetShipping, "isLoggedIn" | "quoteId" | "countryId">;

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart> => {
  const { clientAdmin, site } = ctx;

  const id = getUserCookie(req.headers);
  const cartId = getCartCookie(req.headers);

  const { cart: cartResponse } = await clientAdmin["GET /:site/customer/section/load"]({
    site,
    sections: "cart",
  }, { headers: new Headers({ Cookie: `${SESSION_COOKIE}=${id}` }) }).then((
    res,
  ) => res.json());

  const isLoggedIn = cartResponse?.minicart_improvements?.is_logged_in ?? false;
  const quoteId = cartId ?? "";
  const countryId = cartResponse?.minicart_improvements?.country_id ?? COUNTRY_ID;

  clientAdmin
    ["POST /:site/rest/:site2/V1/digitalhub/set-shipping-to-quote"]({
      site,
      site2: site,
    }, {
      headers: new Headers({ Cookie: `${SESSION_COOKIE}=${id}` }),
      body: { ...props, isLoggedIn, quoteId, countryId },
    });

  return await cart(undefined, req, ctx);
};

export default action;
