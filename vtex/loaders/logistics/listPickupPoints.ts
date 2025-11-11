import type { Place } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { toPlace } from "../../utils/transform.ts";

/**
 * @title List Pickup Points
 * @description List all pickup points
 */
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

export const cache = "stale-while-revalidate";

export const cacheKey = (_props: unknown, _req: Request, _ctx: AppContext) => {
  return "pickup-points-all";
};
