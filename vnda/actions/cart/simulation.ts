import { HttpError } from "../../../utils/http.ts";
import { AppContext } from "../../mod.ts";
import type { ShippingMethod } from "../../utils/client/types.ts";

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
  const {skuId, quantity, zip} = props
  
  if (!skuId || !quantity || !zip) {
    throw new HttpError(400, "Missing cart cookie");
  }

    const cep = await api["GET /api/v2/variants/:skuId/shipping_methods"]({ skuId, quantity, zip });
    return cep.json()
};

export default action;