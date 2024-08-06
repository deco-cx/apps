import { allowCorsFor } from "deco/mod.ts";
import { AppContext } from "../../mod.ts";
import { Orders } from "../../utils/types.ts";

export default async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Orders> {
  Object.entries(allowCorsFor(req)).map(([name, value]) => {
    ctx.response.headers.set(name, value);
  });

  const { vcsDeprecated } = ctx;

  const currentDate = new Date();
  const pastDate = new Date(currentDate);
  pastDate.setFullYear(currentDate.getFullYear() - 1);

  // TODO: This endpoint is failing when we don't specify the creationDate. We need to check with VTEX.
  // https://community.vtex.com/t/get-list-orders-retorna-invalid-f-creationdate/22706
  const ordersResponse = await vcsDeprecated
    ["GET /api/oms/pvt/orders"](
      {
        f_creationDate:
          `creationDate:[${pastDate.toISOString()} TO ${currentDate.toISOString()}]`,
      },
    );

  const ordersList = await ordersResponse.json();

  return ordersList as Orders;
}
