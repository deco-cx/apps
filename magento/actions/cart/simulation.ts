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
  const { clientGuest } = ctx;
  const { cartId, address } = props;

  if (!cartId || !address) {
    badRequest({
      message: "could not find some props",
    });
  }
  const shippingMethod = await clientGuest
    ["POST /V1/guest-carts/:cartId/estimate-shipping-methods"]({
      cartId,
    }, {
      body: {
        address,
      },
    });
  return shippingMethod.json();
};

export default action;
