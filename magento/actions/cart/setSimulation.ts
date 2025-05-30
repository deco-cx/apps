import { AppContext } from "../../mod.ts";
import { getCartCookie, handleCartActions } from "../../utils/cart.ts";
import { OverrideFeatures } from "../../utils/client/types.ts";
import { Cart, SetShipping } from "../../utils/client/types.ts";
import { COUNTRY_ID, SESSION_COOKIE } from "../../utils/constants.ts";
import { getUserCookie } from "../../utils/user.ts";

export type Props = Omit<SetShipping, "quoteId">;

/**
 * @title Magento Integration - Set Shipping Simulation
 * @description Set a shipping simulation to a cart
 */
const action = async (
  props: Props & OverrideFeatures,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { clientAdmin, site, features } = ctx;
  const {
    dangerouslyOverrideReturnNull,
    countryId = COUNTRY_ID,
    isLoggedIn = false,
  } = props;
  const dontReturnCart = dangerouslyOverrideReturnNull ??
    features.dangerouslyReturnNullAfterAction;

  const id = getUserCookie(req.headers);
  const cartId = getCartCookie(req.headers);

  try {
    const quoteId = cartId ?? "";

    await clientAdmin
      ["POST /:site/rest/:site2/V1/digitalhub/set-shipping-to-quote"](
        {
          site,
          site2: site,
        },
        {
          headers: new Headers({ Cookie: `${SESSION_COOKIE}=${id}` }),
          body: { ...props, isLoggedIn, quoteId, countryId },
        },
      );
  } catch (error) {
    return handleCartActions(dontReturnCart, {
      req,
      ctx,
      error,
    });
  }

  return handleCartActions(dontReturnCart, {
    req,
    ctx,
  });
};

export default action;
