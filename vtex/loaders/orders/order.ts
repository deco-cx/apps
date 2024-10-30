import { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import { OrderItem } from "../../utils/types.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface Props {
  slug: RequestURLParam;
}

export default async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<OrderItem | null> {
  const { vcs } = ctx;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const { slug } = props;

  const response = await vcs["GET /api/oms/user/orders/:orderId"](
    { orderId: slug + "-01" },
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
