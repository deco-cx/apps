import { AppContext } from "../../mod.ts";
import type {
  ShippingMethod,
} from "../../utils/client/types.ts";
import { badRequest } from "deco/mod.ts";

export interface Props {
  cartId: string;
  countryId: string;
  postcode: string;
}

const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ShippingMethod[]> => {
  const { clientAdmin, site } = ctx;
  const { cartId, countryId, postcode } = props;

  if (!cartId || !countryId || !postcode) {
    badRequest({
      message: "could not find some props",
    });
  }
  const shippingMethod = await clientAdmin
    ["POST /rest/:site/V1/carts/:cartId/estimate-shipping-methods"]({
      site,
      cartId,
    }, {
      body: {
        address: {
          postcode,
          countryId,
        }
      },
    });
  return shippingMethod.json();
};

export default action;
