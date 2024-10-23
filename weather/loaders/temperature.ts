interface OpenMeteoWeather {
  current: {
    temperature_2m: number;
  };
}

/**
 * @title Optionally set lat and long otherwise the user location will be used
 */
export interface Props {
  lat?: number;
  long?: number;
}
export interface Temperature {
  celsius: number;
}

const weatherFor = (lat: number, long: number): string => {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m`;
};

/**
 * @title OpenMeteo Temperature
 */
export default async function weather(
  { lat: _lat, long: _long }: Props,
  request: Request,
): Promise<Temperature | null> {
  const lat = _lat ?? request.headers.get("Cf-Iplatitude") ?? undefined;
  const long = _long ?? request.headers.get("Cf-Iplongitude") ?? undefined;
  if (!lat || !long) {
    return null;
  }

  const weatherResponse = await fetch(weatherFor(+lat, +long));
  if (!weatherResponse.ok) {
    return null;
  }
  const weather: OpenMeteoWeather = await weatherResponse.json();

  return {
    celsius: weather.current.temperature_2m,
  };
}
