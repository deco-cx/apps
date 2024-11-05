import { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import { Userorderdetails } from "../../utils/openapi/vcs.openapi.gen.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface Props {
  slug: RequestURLParam;
}

export default async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Userorderdetails | null> {
  const { vcs } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  // sub is userEmail
  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  const { slug } = props;

  const response = await vcs["GET /api/oms/user/orders/:orderId"](
    {
      orderId: slug.includes("-") ? slug : slug + "-01",
      clientEmail: payload?.sub,
    },
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
