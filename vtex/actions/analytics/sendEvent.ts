// Intelligent Search analytics integration
import { AppContext } from "../../mod.ts";
import { getISCookiesFromBag } from "../../utils/intelligentSearch.ts";

export type Props =
  | {
    type: "session.ping";
    url: string;
  }
  | {
    type: "page.cart";
    products: {
      productId: string;
      quantity: number;
    }[];
  }
  | {
    type: "page.empty_cart";
    products: [];
  }
  | {
    type: "page.confirmation";
    order: string;
    products: {
      productId: string;
      quantity: number;
      price: number;
    }[];
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
    url: string;
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
  const cookies = getISCookiesFromBag(ctx);

  if (!cookies) {
    throw new Error("Missing IS Cookies");
  }

  await sp["POST /event-api/v1/:account/event"]({ account: ctx.account }, {
    body: {
      ...props,
      ...cookies,
      agent: req.headers.get("user-agent") || "deco-sites/apps",
    },
    headers: {
      "content-type": "application/json",
    },
  });

  return null;
};

export default action;
