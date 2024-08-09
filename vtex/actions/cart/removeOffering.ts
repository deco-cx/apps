import { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { parseCookie } from "../../utils/orderForm.ts";
import { forceHttpsOnAssets } from "../../utils/transform.ts";
import { OrderForm } from "../../utils/types.ts";
import { DEFAULT_EXPECTED_SECTIONS } from "./updateItemAttachment.ts";

export interface Props {
  index: number;
  id: number;
  expectedOrderFormSections?: string[];
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
) => {
  console.log("addOffferings");
  const { index, id, expectedOrderFormSections = DEFAULT_EXPECTED_SECTIONS } =
    props;
  const { vcsDeprecated } = ctx;

  const { orderFormId } = parseCookie(req.headers);
  const cookie = req.headers.get("cookie") ?? "";

  console.log("action index", index);
  console.log("action id", id);
  console.log("oid", orderFormId);
  try {
    const response = await vcsDeprecated
      ["POST /api/checkout/pub/orderForm/:orderFormId/items/:index/offerings/:id/remove"](
        {
          orderFormId,
          id,
          index: index.toString(),
        },
        {
          headers: {
            "content-type": "application/json",
            accept: "application/json",
            cookie,
          },
        },
      );

    console.log("response", response);

    proxySetCookie(response.headers, ctx.response.headers, req.url);

    return forceHttpsOnAssets((await response.json()) as OrderForm);
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export default action;
