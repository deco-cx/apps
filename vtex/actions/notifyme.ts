import { fetchSafe } from "../../utils/fetch.ts";
import { AppContext } from "../mod.ts";
import { paths } from "../utils/paths.ts";
import type { OrderForm } from "../utils/types.ts";

export interface Props {
  email: string;
  skuId: string;
  name?: string;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const url = new URL(`${paths(ctx)["no-cache"]["AviseMe.aspx"]}`);
  const form = new FormData();
  const { email, skuId, name = "" } = props;

  form.append("notifymeClientName", name);
  form.append("notifymeClientEmail", email);
  form.append("notifymeIdSku", skuId);

  const response = await fetchSafe(url, {
    method: "POST",
    body: form,
  });

  return response.json();
};

export default action;
