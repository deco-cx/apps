import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Contact ID
   * @description The ID of the contact to delete
   */
  contactId: string;
}

export interface DeleteResult {
  success: boolean;
  contactId: string;
  message?: string;
}

/**
 * @title Delete Contact
 * @description Archive/delete a contact from HubSpot CRM
 */
export default async function deleteContact(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DeleteResult> {
  const { contactId } = props;

  try {
    const client = new HubSpotClient(ctx);
    await client.deleteObject("contacts", contactId);

    return {
      success: true,
      contactId,
      message: "Contact successfully deleted",
    };
  } catch (error) {
    console.error("Error deleting contact:", error);
    return {
      success: false,
      contactId,
      message: error instanceof Error
        ? error.message
        : "Unknown error occurred",
    };
  }
}
