import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface Props {
  orderId: string;
}

/**
 * @title Get User Order By Id
 * @description The user must be authenticated or have OMS permissions to access this endpoint
 */
export default async function loader(
  { orderId }: Props,
  req: Request,
  ctx: AppContext,
) {
  const { vcsDeprecated } = ctx;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const order = await vcsDeprecated["GET /api/oms/user/orders/:orderId"](
    {
      orderId,
    },
    {
      headers: {
        cookie,
        accept: "application/json",
      },
    },
  ).then((res) => res.json());

  return order;
}
