import { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { parseCookie } from "../../utils/orderForm.ts";
import type { OrderForm, SelectableGifts } from "../../utils/types.ts";
import { DEFAULT_EXPECTED_SECTIONS } from "./updateItemAttachment.ts";

export interface Props extends SelectableGifts {
  expectedOrderFormSections?: string[];
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const { vcsDeprecated } = ctx;
  const {
    expectedOrderFormSections = DEFAULT_EXPECTED_SECTIONS,
    id,
    selectedGifts,
  } = props;
  const { orderFormId } = parseCookie(req.headers);
  const cookie = req.headers.get("cookie") ?? "";

  const response = await vcsDeprecated[
    "POST /api/checkout/pub/orderForm/:orderFormId/selectable-gifts/:giftId"
  ](
    { orderFormId, giftId: id },
    {
      headers: { accept: "application/json", cookie },
      body: { expectedOrderFormSections, selectedGifts, id },
    },
  );

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default action;
