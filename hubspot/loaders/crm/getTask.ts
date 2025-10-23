import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Task ID
   * @description The ID of the task to retrieve
   */
  taskId: string;

  /**
   * @title Properties
   * @description A comma-separated list of task properties to return
   */
  properties?: string[];

  /**
   * @title Properties with History
   * @description Properties to return with their value history
   */
  propertiesWithHistory?: string[];

  /**
   * @title Associations
   * @description Object types to retrieve associated IDs for
   */
  associations?: string[];

  /**
   * @title Include Archived
   * @description Whether to return archived tasks
   */
  archived?: boolean;
}

/**
 * @title Get Task
 * @description Retrieve a specific task from HubSpot CRM by ID
 */
export default async function getTask(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject | null> {
  const { taskId, properties, propertiesWithHistory, associations, archived } =
    props;

  try {
    const client = new HubSpotClient(ctx);
    const task = await client.getObject("tasks", taskId, {
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return task;
  } catch (error) {
    console.error("Error fetching task:", error);
    return null;
  }
}
