import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  SimplePublicObject,
  SimplePublicObjectInput,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Task Properties
   * @description Key-value pairs of task properties
   */
  properties: Record<string, string>;

  /**
   * @title Associations
   * @description Objects to associate with this task
   */
  associations?: Array<{
    to: {
      id: string;
    };
    types: Array<{
      associationCategory: string;
      associationTypeId: number;
    }>;
  }>;
}

/**
 * @title Create Task
 * @description Create a new task in HubSpot CRM
 */
export default async function createTask(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject> {
  const { properties, associations } = props;

  const client = new HubSpotClient(ctx);

  const taskInput: SimplePublicObjectInput = {
    properties,
    ...(associations && { associations }),
  };

  const task = await client.createObject("tasks", taskInput);
  return task;
}
