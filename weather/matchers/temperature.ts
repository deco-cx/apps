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
