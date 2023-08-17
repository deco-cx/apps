// Intelligent Search analytics integration
import { AppContext } from "apps/vtex/mod.ts";
import { fetchSafe } from "apps/utils/fetch.ts";
import { getOrSetISCookie } from "apps/vtex/utils/intelligentSearch.ts";
import { paths } from "apps/vtex/utils/paths.ts";

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
  const { anonymous, session } = getOrSetISCookie(req, ctx.response.headers);

  await fetchSafe(
    paths(ctx)["event-api"].v1.account.event,
    {
      method: "POST",
      body: JSON.stringify({
        ...props,
        agent: "deco-sites/std",
        anonymous,
        session,
      }),
      headers: {
        "content-type": "application/json",
      },
    },
  );

  return null;
};

export default action;
