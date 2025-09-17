import type { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface Props {
  orderId: string;
  reason: string;
}

/**
 * @title Cancel Order
 * @description Cancel an order
 */
async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<unknown> {
  const { orderId, reason } = props;
  const { vcsDeprecated } = ctx;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const response = await vcsDeprecated
    ["POST /api/checkout/pub/orders/:orderId/user-cancel-request"](
      { orderId },
      {
        body: { reason },
        headers: { cookie },
      },
    );

  if (!response.ok) {
    throw new Error(
      `Failed to cancel order: ${response.status} ${response.statusText}`,
    );
  }

  return new Response(null, { status: 204 });
}

export default action;
