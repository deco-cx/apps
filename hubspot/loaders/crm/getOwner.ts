import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { Owner } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Owner ID
   * @description The ID of the owner to retrieve
   */
  ownerId: string;

  /**
   * @title ID Property
   * @description The property to use as the ID (id, email, userId)
   */
  idProperty?: "id" | "email" | "userId";

  /**
   * @title Include Archived
   * @description Whether to include archived owners
   */
  archived?: boolean;
}

/**
 * @title Get CRM Owner
 * @description Retrieve a specific CRM owner by ID from HubSpot
 */
export default async function getOwner(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Owner | null> {
  const { ownerId, idProperty, archived = false } = props;

  try {
    const client = new HubSpotClient(ctx);

    const searchParams: Record<string, string | number | boolean | undefined> =
      {
        archived,
      };

    if (idProperty) {
      searchParams.idProperty = idProperty;
    }

    const owner = await client.get<Owner>(
      `/crm/v3/owners/${ownerId}`,
      searchParams,
    );

    return owner;
  } catch (error) {
    console.error("Error fetching owner:", error);
    return null;
  }
}
