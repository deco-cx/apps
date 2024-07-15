import { Temperature } from "../loaders/temperature.ts";

export interface TemperatureProps {
  /**
   * @title Current Temperature
   * @description The current temperature
   * @examples [{"celsius": 20}]
   */
  temperature?: Temperature | null;
}

export default function WhatsTheTemperature({ temperature }: TemperatureProps) {
  return (
    <div className="p-1">
      <p className="text-sm">The temperature now is</p>
      <p className="text-xl">{temperature ? temperature.celsius : 20.2}°C</p>
    </div>
  );
}
