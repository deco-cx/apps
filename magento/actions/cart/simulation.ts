import { AppContext } from "../../mod.ts";
import type {
  CustomerAddress,
  ShippingMethod,
} from "../../utils/client/types.ts";
import { badRequest } from "deco/mod.ts";

export interface Props {
  cartId: string;
  address: CustomerAddress;
}

const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ShippingMethod[]> => {
  const { clientAdmin, site } = ctx;
  const { cartId, address } = props;

  if (!cartId || !address) {
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
        address,
      },
    });
  return shippingMethod.json();
};

export default action;
