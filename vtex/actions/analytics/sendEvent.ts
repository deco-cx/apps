// Intelligent Search analytics integration
import { AppContext } from "../../mod.ts";
import { getOrSetISCookie } from "../../utils/intelligentSearch.ts";

export type Props =
  | {
    type: "session.ping";
  }
  | {
    type: "search.click";
    position: number;
    text: string;
    productId: string;
    url: string;
  }
  | {
    type: "search.query";
    text: string;
    misspelled: boolean;
    match: number;
    operator: string;
    locale: string;
  };

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<null> => {
  const { sp } = ctx;
  const { anonymous, session } = getOrSetISCookie(req, ctx.response.headers);

  await sp["POST /event-api/v1/:account/event"]({ account: ctx.account }, {
    body: {
      ...props,
      anonymous,
      session,
      agent: "deco-sites/apps",
    },
    headers: {
      "content-type": "application/json",
    },
  });

  return null;
};

export default action;
