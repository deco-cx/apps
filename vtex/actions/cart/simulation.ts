import { paths } from "../../utils/paths.ts";
import { fetchSafe } from "apps/utils/fetch.ts";
import { AppContext } from "apps/vtex/mod.ts";
import type { SimulationOrderForm } from "apps/vtex/utils/types.ts";

export interface Item {
  id: number;
  quantity: number;
  seller: string;
}

export interface Props {
  items: Item[];
  postalCode: string;
  country: string;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForms/simulation
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimulationOrderForm> => {
  const {
    items,
    postalCode,
    country,
  } = props;
  const response = await fetchSafe(
    paths(ctx).api.checkout.pub.orderForms.simulation,
    {
      method: "POST",
      body: JSON.stringify({ items, postalCode, country }),
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
    },
  );

  return response.json();
};

export default action;
