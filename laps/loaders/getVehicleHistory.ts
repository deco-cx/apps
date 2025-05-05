import { AppContext } from "../mod.ts";
import { VehicleHistory } from "../client.ts";

export interface Props {
  /**
   * @title License Plate
   * @description Vehicle license plate to search for (e.g., PFW1740)
   */
  placa: string;
}

/**
 * @title Get Vehicle History
 * @description Fetches the maintenance history for a vehicle by license plate
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<VehicleHistory> => {
  const { placa } = props;

  try {
    const response = await ctx.api["GET /historico"]({
      placa,
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching vehicle history:", error);
    throw error;
  }
};

export default loader;
