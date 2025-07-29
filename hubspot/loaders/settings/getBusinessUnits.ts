import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { BusinessUnitsResponse } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Include Logos
   * @description Whether to include logo information in the response
   */
  includeLogos?: boolean;
}

/**
 * @title Get Business Units
 * @description Retrieve all business units from HubSpot Settings
 */
export default async function getBusinessUnits(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BusinessUnitsResponse> {
  const { includeLogos = false } = props;

  try {
    const client = new HubSpotClient(ctx);

    const searchParams: Record<string, string | number | boolean | undefined> =
      {};

    if (includeLogos) {
      searchParams.includeLogos = includeLogos;
    }

    const response = await client.get<BusinessUnitsResponse>(
      "/settings/v3/business-units",
      searchParams,
    );

    return {
      results: response.results || [],
    };
  } catch (error) {
    console.error("Error fetching business units:", error);
    return {
      results: [],
    };
  }
}
