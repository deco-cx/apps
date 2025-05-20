import { AppContext } from "../mod.ts";
import { ContactsResponse } from "../client.ts";

export interface Props {
  /**
   * @title Segmentation ID
   * @description The ID of the segmentation to retrieve contacts from
   */
  id: string;
}

/**
 * @title Get Segmentation Contacts
 * @description Retrieves all contacts from a specific segmentation
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ContactsResponse> => {
  const response = await ctx.api["GET /platform/segmentations/:id/contacts"]({
    id: props.id,
  });
  const result = await response.json();

  return result;
};

export default loader;
