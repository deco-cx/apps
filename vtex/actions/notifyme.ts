import { AppContext } from "../mod.ts";

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
): Promise<void> => {
  const { vcsDeprecated } = ctx;
  const form = new FormData();
  const { email, skuId, name = "" } = props;

  form.append("notifymeClientName", name);
  form.append("notifymeClientEmail", email);
  form.append("notifymeIdSku", skuId);

  await vcsDeprecated["POST /no-cache/AviseMe.aspx"]({}, { body: form });
};

export default action;
