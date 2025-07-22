import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Quote ID
   * @description The ID of the quote to retrieve
   */
  quoteId: string;

  /**
   * @title Properties
   * @description A comma-separated list of quote properties to return
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
   * @description Whether to return archived quotes
   */
  archived?: boolean;
}

/**
 * @title Get Quote
 * @description Retrieve a specific quote from HubSpot CRM by ID
 */
export default async function getQuote(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject | null> {
  const { quoteId, properties, propertiesWithHistory, associations, archived } =
    props;

  try {
    const client = new HubSpotClient(ctx);
    const quote = await client.getObject("quotes", quoteId, {
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return quote;
  } catch (error) {
    console.error("Error fetching quote:", error);
    return null;
  }
}
