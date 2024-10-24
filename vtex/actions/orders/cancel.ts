import { parseCookie } from "../../utils/vtexId.ts";
import { AppContext } from "../../mod.ts";

interface Props {
  orderId: string;
}

async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
) {
  const { vcsDeprecated } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  const { orderId } = props;

  const response = await vcsDeprecated
    ["POST /api/oms/user/orders/:orderId/cancel"](
      { orderId },
      {
        headers: {
          cookie,
        },
      },
    );

  if (response.ok) {
    const order = await response.json();
    return order;
  }

  return null;
}

export default action;
