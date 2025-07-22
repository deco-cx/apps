import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Object Type
   * @description The object type for the pipelines (deals, tickets, etc.)
   */
  objectType?: "deals" | "tickets";
}

export interface PipelineStage {
  id: string;
  label: string;
  displayOrder: number;
  probability?: number;
  closed?: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface Pipeline {
  id: string;
  label: string;
  displayOrder: number;
  stages: PipelineStage[];
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface PipelinesResponse {
  results: Pipeline[];
}

/**
 * @title Get Pipelines
 * @description Retrieve sales pipelines and their stages from HubSpot CRM
 */
export default async function getPipelines(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PipelinesResponse> {
  const { objectType = "deals" } = props;

  try {
    const client = new HubSpotClient(ctx);
    const response = await client.get<PipelinesResponse>(
      `/crm/v3/pipelines/${objectType}`,
    );

    return {
      results: response.results || [],
    };
  } catch (error) {
    console.error("Error fetching pipelines:", error);
    return {
      results: [],
    };
  }
}
