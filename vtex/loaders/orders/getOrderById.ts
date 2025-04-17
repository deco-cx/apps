import { HttpError } from "@deco/deco";
import { AppContext } from "../../mod.ts";
import { Userorderdetails } from "../../utils/openapi/vcs.openapi.gen.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface Props {
  orderId: string;
}

export default async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Userorderdetails> {
  const { vcs } = ctx;
  const { orderId } = props;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  const user = await ctx.invoke.vtex.loaders.user();
  if (!user) {
    throw new HttpError(new Response("Unauthorized", { status: 403 }));
  }

  const response = await vcs["GET /api/oms/user/orders/:orderId"](
    {
      orderId: orderId.includes("-") ? orderId : `${orderId}-01`,
      clientEmail: payload?.sub ?? "",
    },
    {
      headers: { cookie },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to get order: ${response.status} ${response.statusText}`,
    );
  }

  const order = await response.json();

  if (order.clientProfileData?.email !== user.email) {
    throw new HttpError(new Response("Unauthorized", { status: 403 }));
  }

  return order;
}

export const defaultVisibility = "private";
