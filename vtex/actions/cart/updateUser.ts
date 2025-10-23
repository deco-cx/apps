import { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { parseCookie } from "../../utils/orderForm.ts";
import { getSegmentFromBag } from "../../utils/segment.ts";
import { logger } from "@deco/deco/o11y";

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/checkout/changeToAnonymousUser/-orderFormId-
 * @title Update User
 * @description Update the user
 */
const action = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<boolean> => {
  try {
    const { vcsDeprecated } = ctx;
    const { orderFormId } = parseCookie(req.headers);
    const cookie = req.headers.get("cookie") ?? "";
    const segment = getSegmentFromBag(ctx);
    const response = await vcsDeprecated[
      "GET /checkout/changeToAnonymousUser/:orderFormId"
    ](
      {
        orderFormId,
        sc: segment?.payload.channel,
      },
      {
        headers: {
          accept: "application/json",
          cookie,
          redirect: "manual",
        },
      },
    );
    if (response.status >= 400) {
      logger.error(
        `Failed fetch request to change orderform to anonymous user: ${response.status} ${response.statusText}`,
      );
      return false;
    }

    // Consume the body to free resources
    await response.text();

    proxySetCookie(response.headers, ctx.response.headers, req.url);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Error changing orderform to anonymous user", {
      error: errorMessage,
    });
    return false;
  }
};

export default action;
