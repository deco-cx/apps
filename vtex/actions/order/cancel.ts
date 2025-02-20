import { AppContext } from "../../mod.ts";
import { CanceledOrder } from "../../utils/types.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface Props {
  orderId: string;
  reason: string;
}

async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CanceledOrder | null> {
  const { vcs } = ctx;
  const { orderId, reason } = props;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  const result = await vcs["POST /api/oms/pvt/orders/:orderId/cancel"](
    { orderId },
    {
      body: { reason },
      headers: { cookie },
    },
  ).then((res) => res.json());

  return result;
}

export const defaultVisibility = "private";
export default action;
