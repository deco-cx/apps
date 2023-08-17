import { paths } from "../../utils/paths.ts";
import { fetchSafe } from "apps/utils/fetch.ts";
import { AppContext } from "apps/vtex/mod.ts";
import type { OrderForm } from "apps/vtex/utils/types.ts";

export interface Props {
  email: string;
  name?: string;
  page?: string;
  part?: string;
  campaing?: string;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const url = new URL(`${paths(ctx)["no-cache"]["Newsletter.aspx"]}`);
  const form = new FormData();
  const {
    email,
    name = "",
    part = "newsletter",
    page = "_",
    campaing = "newsletter:opt-in",
  } = props;

  form.append("newsletterClientName", name);
  form.append("newsletterClientEmail", email);
  form.append("newsInternalPage", page);
  form.append("newsInternalPart", part);
  form.append("newsInternalCampaign", campaing);

  const response = await fetchSafe(url, {
    method: "POST",
    body: form,
  });

  return response.json();
};

export default action;
