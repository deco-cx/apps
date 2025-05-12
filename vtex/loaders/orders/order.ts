import { HttpError } from "@deco/deco";
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
  const { cookie } = parseCookie(req.headers, ctx.account);

  const { slug } = props;

  const user = await ctx.invoke.vtex.loaders.user();
  if (!user?.email) {
    throw new HttpError(new Response("Unauthorized", { status: 403 }));
  }

  const response = await vcs["GET /api/oms/user/orders/:orderId"](
    {
      orderId: slug.includes("-") ? slug : slug + "-01",
      clientEmail: user.email,
    },
    {
      headers: {
        cookie,
      },
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
