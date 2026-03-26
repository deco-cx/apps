import { AppContext } from "../../mod.ts";
import { getOrigin, parseCookie } from "../../utils/recommendations.ts";

interface Props {
  /**
   * @title User ID
   * @description The ID of the user who viewed the recommendation.
   */
  userId?: string;
  /**
   * @title Product ID
   * @description The ID of the product that was clicked.
   */
  productId: string;
  /**
   * @title Correlation ID
   * @description The correlation ID of the recommendation request.
   */
  correlationId: string;
  /**
   * @description The origin of the recommendation request. E.g: apiexamples/storefront/vtex.recommendation-shelf@2.x
   */
  "x-vtex-rec-origin"?: string;
}

export default async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
) {
  const { bff } = ctx;

  const origin = getOrigin(req, ctx.account, props["x-vtex-rec-origin"]);
  if (!origin) {
    throw new Error("x-vtex-rec-origin header is required");
  }

  const cookies = parseCookie(req.headers);
  const userId = props.userId ?? cookies?.userId;

  if (!userId) {
    throw new Error("userId is required");
  }

  await bff["POST /api/recommend-bff/v2/events/recommendation-click"]({
    an: ctx.account,
  }, {
    body: {
      correlationId: props.correlationId,
      userId,
      product: props.productId,
    },
    headers: {
      "x-vtex-rec-origin": origin,
    },
  });

  return { ok: true };
}
