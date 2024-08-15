import { AppContext } from "../../mod.ts";
import { Userorderslist } from "../../utils/openapi/vcs.openapi.gen.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface Props {
  clientEmail: string;
  page?: string;
  per_page?: string;
}

export default async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Userorderslist> {
  const { vcsDeprecated } = ctx;
  const { clientEmail, page = "0", per_page = "15" } = props;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const ordersResponse = await vcsDeprecated
    ["GET /api/oms/user/orders"](
      {
        clientEmail,
        page,
        per_page,
      },
      {
        headers: {
          cookie,
        },
      },
    );

  const ordersList = await ordersResponse.json();

  return ordersList;
}
