import { MapWidget } from "../../admin/widgets.ts";
import { haversine } from "../utils/location.ts";
import { type MatchContext } from "@deco/deco/blocks";
export interface Coordinate {
  latitude: number;
  longitude: number;
  radius?: number;
}
export interface Map {
  /**
   * @title Area selection
   * @example -7.27820,-35.97630,2000
   */
  coordinates?: MapWidget;
}
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
  includeLocations?: (Location | Map)[];
  /**
   * @title Exclude Locations
   */
  excludeLocations?: (Location | Map)[];
}
export interface MapLocation {
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
  /**
   * @title Area selection
   * @example -7.27820,-35.97630,2000
   */
  coordinates?: MapWidget;
}
const matchLocation =
  (defaultNotMatched = true, source: MapLocation) => (target: MapLocation) => {
    if (
      !target.regionCode &&
      !target.city &&
      !target.country &&
      !target.coordinates
    ) {
      return defaultNotMatched;
    }
    let result = !target.regionCode || target.regionCode === source.regionCode;
    result &&= !source.coordinates ||
      !target.coordinates ||
      haversine(source.coordinates, target.coordinates) <=
        Number(target.coordinates.split(",")[2]);
    result &&= !target.city || target.city === source.city;
    result &&= !target.country || target.country === source.country;
    return result;
  };
const escaped = (
  { city, country, regionCode, coordinates }: MapLocation,
): MapLocation => {
  return {
    coordinates,
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
  const latitude = request.headers.get("cf-iplatitude") ?? undefined;
  const longitude = request.headers.get("cf-iplongitude") ?? undefined;
  const coordinates = latitude ? `${latitude},${longitude}` : undefined;
  const userLocation = { city, country, regionCode, coordinates };
  const isLocationExcluded =
    excludeLocations?.some(matchLocation(false, escaped(userLocation))) ??
      false;
  if (isLocationExcluded) {
    return false;
  }
  if (includeLocations?.length === 0) {
    return true;
  }
  return (includeLocations?.some(matchLocation(true, escaped(userLocation))) ??
    true);
}
