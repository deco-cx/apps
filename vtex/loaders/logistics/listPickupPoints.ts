import { AppContext } from "../../mod.ts";

export default async function loader(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
) {
  const { vcs } = ctx;

  const pickupPoints = await vcs
    ["GET /api/logistics/pvt/configuration/pickuppoints"]({})
    .then((r) => r.json());

  return pickupPoints;
}
