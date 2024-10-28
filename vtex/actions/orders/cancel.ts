import { parseCookie } from "../../utils/vtexId.ts";
import { AppContext } from "../../mod.ts";
import { CanceledOrder } from "../../utils/types.ts";

interface Props {
  orderId: string;
  reason: string;
}

async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CanceledOrder | null> {
  const { vcsDeprecated } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  const { orderId, reason } = props;

  const response = await vcsDeprecated
    ["POST /api/oms/user/orders/:orderId/cancel"](
      { orderId },
      {
        body: { reason },
        headers: {
          cookie,
        },
      },
    );

  if (response.ok) {
    const canceledOrder = await response.json();
    return canceledOrder;
  }

  return null;
}

export default action;
