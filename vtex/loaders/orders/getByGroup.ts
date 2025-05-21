import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";
import { OpenAPI } from "../../utils/openapi/vcs.openapi.gen.ts";
interface Props {
  orderGroup: string;
}

export type OrderGrouped =
  OpenAPI["GET /api/oms/pvt/orders/order-group/:orderGroup"]["response"];

/**
 * @title VTEX - Get User Order By Group
 * @description The user must be authenticated or have OMS permissions to access this endpoint
 */
export default async function loader(
  { orderGroup }: Props,
  req: Request,
  ctx: AppContext,
): Promise<OrderGrouped> {
  const { vcs } = ctx;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const order = await vcs["GET /api/oms/pvt/orders/order-group/:orderGroup"](
    {
      orderGroup,
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
