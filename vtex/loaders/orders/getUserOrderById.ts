import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface Props {
  orderId: string;
}

/**
 * @title VTEX - Get User Order By Id
 * @description Gets user order by id, the user must be authenticated or have access to the order
 */
export default async function loader(
  { orderId }: Props,
  req: Request,
  ctx: AppContext,
) {
  const { vcsDeprecated } = ctx;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const order = await vcsDeprecated["GET /api/checkout/pub/orders/:orderId"]({
    orderId,
  }, {
    headers: { cookie },
  }).then((res) => res.json());

  return order;
}
