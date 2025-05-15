import { AppContext } from "../../mod.ts";
import { getCartCookie } from "../../utils/cart.ts";
import type { ShippingMethod } from "../../utils/client/types.ts";

export interface Props {
  countryId: string;
  postcode: string;
}

/**
 * @title Magento Integration - Shipping Simulations
 * @description Get Shipping Simulations of a cart
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ShippingMethod[]> => {
  const { clientAdmin, site } = ctx;
  const { countryId, postcode } = props;
  const cartId = getCartCookie(req.headers);

  const shippingMethod = await clientAdmin
    ["POST /rest/:site/V1/carts/:cartId/estimate-shipping-methods"]({
      site,
      cartId,
    }, {
      body: {
        address: {
          postcode,
          countryId,
        },
      },
    }).then((res) => res.json());
  return shippingMethod;
};

export default action;
