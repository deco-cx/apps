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
  const { vcsDeprecated } = ctx;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const { slug } = props;

  const response = await vcsDeprecated["GET /api/oms/user/orders/:orderId"](
    { orderId: slug },
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
