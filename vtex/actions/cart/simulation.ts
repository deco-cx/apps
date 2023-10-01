import { AppContext } from "../../mod.ts";
import type { SimulationOrderForm } from "../../utils/types.ts";

export interface Item {
  id: number;
  quantity: number;
  seller: string;
}

export interface Props {
  items: Item[];
  postalCode: string;
  country: string;
  RnbBehavior?: 0 | 1;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForms/simulation
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimulationOrderForm> => {
  const { vcs } = ctx;
  const { items, postalCode, country, RnbBehavior = 1 } = props;

  const response = await vcs["POST /api/checkout/pub/orderForms/simulation"](
    {
      RnbBehavior,
    },
    {
      body: { items, country, ...(postalCode && { postalCode }) },
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
    },
  );

  return response.json();
};

export default action;
