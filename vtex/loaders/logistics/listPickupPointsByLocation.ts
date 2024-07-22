import { AppContext } from "../../mod.ts";

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

export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { geoCoordinates, postalCode, countryCode } = props;
  const { vcs } = ctx;

  const _props = geoCoordinates
    ? { geoCoordinates }
    : { postalCode, countryCode };

  const pickupPoints = await vcs
    ["GET /api/checkout/pub/pickup-points"](_props)
    .then((r) => r.json());

  return pickupPoints;
}
