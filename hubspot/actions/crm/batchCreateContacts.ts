import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  BatchResponseSimplePublicObjectWithErrors,
  SimplePublicObjectInput,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Contacts to Create
   * @description Array of contact objects to create in batch
   */
  inputs: Array<{
    properties: Record<string, string>;
    associations?: Array<{
      to: {
        id: string;
      };
      types: Array<{
        associationCategory: string;
        associationTypeId: number;
      }>;
    }>;
  }>;
}

/**
 * @title Batch Create Contacts
 * @description Create multiple contacts in a single batch operation
 */
export default async function batchCreateContacts(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BatchResponseSimplePublicObjectWithErrors> {
  const { inputs } = props;

  const client = new HubSpotClient(ctx);

  const batchRequest = {
    inputs: inputs.map((input): SimplePublicObjectInput => ({
      properties: input.properties,
      ...(input.associations && { associations: input.associations }),
    })),
  };

  const response = await client.batchCreateObjects("contacts", batchRequest);
  return response;
}
