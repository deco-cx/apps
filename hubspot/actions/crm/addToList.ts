import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title List ID
   * @description The ID of the list to add contacts to
   */
  listId: number;

  /**
   * @title Contact IDs
   * @description Array of contact IDs to add to the list
   */
  contactIds?: number[];

  /**
   * @title Emails
   * @description Array of email addresses to add to the list
   */
  emails?: string[];
}

export interface AddToListResponse {
  updated: number[];
  discarded: number[];
  invalidEmails: string[];
  invalidContactIds: number[];
}

/**
 * @title Add Contacts to List
 * @description Add contacts to a static list in HubSpot
 */
export default async function addToList(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AddToListResponse> {
  const { listId, contactIds, emails } = props;

  if (!contactIds && !emails) {
    throw new Error("Either contactIds or emails must be provided");
  }

  const client = new HubSpotClient(ctx);

  const addData = {
    ...(contactIds && { contactIds }),
    ...(emails && { emails }),
  };

  const response = await client.post<AddToListResponse>(
    `/contacts/v1/lists/${listId}/add`,
    addData,
  );

  return response;
}
