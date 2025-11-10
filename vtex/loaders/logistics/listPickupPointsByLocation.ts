import type { Place } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { toPlace } from "../../utils/transform.ts";
import type { PickupPoint } from "../../utils/types.ts";

interface Props {
  /**
   * @description Geocoordinates (first longitude, then latitude) around which to search for pickup points. If you use this type of search, do not pass postal and country codes.
   */
  geoCoordinates?: number[];
  /**
   * @description Postal code around which to search for pickup points. If you use this type of search, make sure to pass a countryCode and do not pass geoCoordinates.
   */
  postalCode?: string;
  /**
   * @description Three letter country code referring to the postalCode field. Pass the country code only if you are searching pickup points by postal code.
   */
  countryCode?: string;
}

/**
 * @title List Pickup Points by Location
 * @description List pickup points by location
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Place[]> {
  const { geoCoordinates, postalCode, countryCode } = props;
  const { vcs } = ctx;

  const _props = geoCoordinates
    ? { geoCoordinates }
    : { postalCode, countryCode };

  const pickupPoints = await vcs
    ["GET /api/checkout/pub/pickup-points"](_props)
    .then((r) => r.json()) as {
      paging: { page: number; pageSize: number; total: number; pages: number };
      items: { distance: number; pickupPoint: PickupPoint }[];
    };

  return pickupPoints.items?.map(({ distance, pickupPoint }) =>
    toPlace({
      distance,
      ...pickupPoint,
    }, {
      // this object comes from the checkout api, that should only show the active pickup points
      isActive: true,
    })
  ) ?? [];
}
