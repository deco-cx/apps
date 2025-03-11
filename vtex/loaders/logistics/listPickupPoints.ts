import type { Place } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { toPlace } from "../../utils/transform.ts";

export default async function loader(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Place[]> {
  const { vcs } = ctx;

  const pickupPoints = await vcs
    ["GET /api/logistics/pvt/configuration/pickuppoints"]({})
    .then((r) => r.json());

  return pickupPoints.map((pickup) => toPlace(pickup));
}
