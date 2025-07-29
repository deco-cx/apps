import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of workflows to return (default: 20, max: 100)
   */
  limit?: number;

  /**
   * @title Offset
   * @description Offset for pagination
   */
  offset?: number;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  type:
    | "DRIP_DELAY"
    | "PROPERTY_ANCHOR"
    | "DATE_ANCHOR"
    | "FORM_SUBMISSION"
    | "STATIC_ANCHOR";
  enabled: boolean;
  insertedAt: string;
  updatedAt: string;
  contactListIds: {
    enrolled: number[];
    active: number[];
    completed: number[];
    succeeded: number[];
  };
  portalId: number;
  isSegmentationOnly: boolean;
  migrationStatus: {
    portalId: number;
    workflowId: number;
    migrationStatus: string;
    migrationStatusUpdateTime: number;
  };
}

export interface WorkflowsResponse {
  workflows: Workflow[];
  hasMore: boolean;
  offset: number;
}

/**
 * @title Get Workflows
 * @description Retrieve automation workflows from HubSpot
 */
export default async function getWorkflows(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<WorkflowsResponse> {
  const { limit = 20, offset = 0 } = props;

  try {
    const client = new HubSpotClient(ctx);
    const response = await client.get<WorkflowsResponse>(
      "/automation/v2/workflows",
      {
        limit: Math.min(limit, 100),
        offset,
      },
    );

    return {
      workflows: response.workflows || [],
      hasMore: response.hasMore || false,
      offset: response.offset || 0,
    };
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return {
      workflows: [],
      hasMore: false,
      offset: 0,
    };
  }
}
