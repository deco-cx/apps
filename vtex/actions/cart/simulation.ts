import { AppContext } from "../../mod.ts";
import type { SimulationOrderForm } from "../../utils/types.ts";
import { getSegmentFromBag } from "../../utils/segment.ts";

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
  req: Request,
  ctx: AppContext,
): Promise<SimulationOrderForm> => {
  const cookie = req.headers.get("cookie") ?? "";
  const { vcsDeprecated } = ctx;
  const { items, postalCode, country, RnbBehavior = 1 } = props;
  const segment = getSegmentFromBag(ctx);

  const response = await vcsDeprecated[
    "POST /api/checkout/pub/orderForms/simulation"
  ](
    {
      RnbBehavior,
      sc: segment?.payload.channel,
    },
    {
      body: { items, country, postalCode },
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        cookie,
      },
    },
  );

  return response.json();
};

export default action;
