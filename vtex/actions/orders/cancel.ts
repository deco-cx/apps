import { parseCookie } from "../../utils/vtexId.ts";
import { AppContext } from "../../mod.ts";
import { CanceledOrder } from "../../utils/types.ts";

interface Props {
  orderId: string;
  reason: string;
  requestedByUser: boolean;
}

async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CanceledOrder | null> {
  const { vcs } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  const { orderId, reason, requestedByUser } = props;

  const response = await vcs
    ["POST /api/oms/pvt/orders/:orderId/cancel"](
      { orderId },
      {
        body: { reason, requestedByUser },
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
