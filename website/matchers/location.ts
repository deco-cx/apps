import { MatchContext } from "deco/blocks/matcher.ts";

/**
 * @title {{{city}}} {{{regionCode}}} {{{country}}}
 */
export interface Location {
  /**
   * @title City
   * @example São Paulo
   */
  city?: string;
  /**
   * @title Region Code
   * @example SP
   */
  regionCode?: string;
  /**
   * @title Country
   * @example BR
   */
  country?: string;
}

export interface Props {
  /**
   * @title Include Locations
   */
  includeLocations?: Location[];
  /**
   * @title Exclude Locations
   */
  excludeLocations?: Location[];
}

const matchLocation =
  (defaultNotMatched = true, source: Location) => (target: Location) => {
    if (!target.regionCode && !target.city && !target.country) {
      return defaultNotMatched;
    }
    let result = !target.regionCode || target.regionCode === source.regionCode;
    result &&= !target.city || target.city === source.city;
    result &&= !target.country || target.country === source.country;
    return result;
  };

const escaped = ({ city, country, regionCode }: Location): Location => {
  return {
    regionCode,
    city: city ? decodeURIComponent(escape(city)) : city,
    country: country ? decodeURIComponent(escape(country)) : country,
  };
};
/**
 * @title Location
 * @description Target users based on their geographical location, such as country, city, or region
 * @icon map-2
 */
export default function MatchLocation(
  { includeLocations, excludeLocations }: Props,
  { request }: MatchContext,
) {
  const city = request.headers.get("cf-ipcity") ?? undefined;
  const country = request.headers.get("cf-ipcountry") ?? undefined;
  const regionCode = request.headers.get("cf-region-code") ?? undefined;
  const userLocation = { city, country, regionCode };
  const isLocationExcluded = excludeLocations?.some(
    matchLocation(false, escaped(userLocation)),
  ) ?? false;
  if (isLocationExcluded) {
    return false;
  }

  if (includeLocations?.length === 0) {
    return true;
  }

  return includeLocations?.some(matchLocation(true, escaped(userLocation))) ??
    true;
}
