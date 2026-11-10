import type { Temperature } from "../loaders/temperature.ts";
/**
 * @title {{{from}}}C ~ {{{to}}}C
 */
interface TemperatureRange {
  from?: number;
  to?: number;
}

export interface Props {
  /**
   * @title Temperature Range
   */
  temperatureRanges?: TemperatureRange[];

  /**
   * @title Current Temperature
   */
  temperature: Temperature | null;
}

/**
 * The weather match is derived from the visitor's geo (Cf-Iplatitude /
 * Cf-Iplongitude) and never from per-user identity, so it is safe to bake
 * into cached HTML shared across visitors. Without this, any page using this
 * matcher falls through to `Cache-Control: no-store` (see blocks/matcher.ts).
 */
export const cacheable = true;

/**
 * @title Weather
 * @description Target users based on specific temperature
 * @icon cloud-storm
 */
export default function MatchWeather(
  { temperatureRanges, temperature }: Props,
) {
  if (!temperatureRanges || !temperature) {
    return false;
  }
  return temperatureRanges.some(({ from, to }) =>
    (!from || from <= temperature.celsius) && (!to || to >= temperature.celsius)
  );
}
