import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title From Object Type
   * @description The source object type
   */
  fromObjectType:
    | "contacts"
    | "companies"
    | "deals"
    | "tickets"
    | "calls"
    | "meetings"
    | "notes"
    | "tasks";

  /**
   * @title From Object ID
   * @description The ID of the source object
   */
  fromObjectId: string;

  /**
   * @title To Object Type
   * @description The target object type
   */
  toObjectType:
    | "contacts"
    | "companies"
    | "deals"
    | "tickets"
    | "calls"
    | "meetings"
    | "notes"
    | "tasks";

  /**
   * @title To Object ID
   * @description The ID of the target object
   */
  toObjectId: string;

  /**
   * @title Association Type ID
   * @description The association type ID (optional, uses default if not provided)
   */
  associationTypeId?: number;
}

export interface AssociationResult {
  fromObjectId: string;
  toObjectId: string;
  associationType: string;
}

/**
 * @title Create Association
 * @description Create an association between two CRM objects
 */
export default async function createAssociation(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AssociationResult> {
  const {
    fromObjectType,
    fromObjectId,
    toObjectType,
    toObjectId,
    associationTypeId,
  } = props;

  const client = new HubSpotClient(ctx);

  const associationData = [
    {
      to: {
        id: toObjectId,
      },
      types: [
        {
          associationCategory: "HUBSPOT_DEFINED",
          associationTypeId: associationTypeId || 1, // Default association type
        },
      ],
    },
  ];

  const response = await client.put<{ results: AssociationResult[] }>(
    `/crm/v4/objects/${fromObjectType}/${fromObjectId}/associations/${toObjectType}`,
    { inputs: associationData },
  );

  return response.results[0];
}
