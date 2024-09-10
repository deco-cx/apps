import { AppContext } from "../../mod.ts";
import type { ShippingMethod } from "../../utils/client/types.ts";
import { badRequest } from "deco/mod.ts";

export interface Props {
  skuId: string;
  quantity: number;
  zip: string;
}

const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ShippingMethod[]> => {
  const { api } = ctx;
  const { skuId, quantity, zip } = props;

  if (!skuId || !quantity || !zip) {
    badRequest({
      message: "could not find some props",
    });
  }
  const cep = await api["GET /api/v2/variants/:sku/shipping_methods"]({
    sku: skuId,
    quantity,
    zip,
  });
  return cep.json();
};

export default action;
