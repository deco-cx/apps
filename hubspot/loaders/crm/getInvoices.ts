import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { InvoicesResponse } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Limit
   * @description Maximum number of invoices to return (default: 10, max: 100)
   */
  limit?: number;

  /**
   * @title After
   * @description Pagination cursor token
   */
  after?: string;

  /**
   * @title Properties
   * @description List of properties to retrieve
   */
  properties?: string[];

  /**
   * @title Properties with History
   * @description List of properties to retrieve with history
   */
  propertiesWithHistory?: string[];

  /**
   * @title Associations
   * @description List of associations to retrieve
   */
  associations?: string[];

  /**
   * @title Include Archived
   * @description Whether to include archived invoices
   */
  archived?: boolean;
}

/**
 * @title Get Invoices
 * @description Retrieve a list of invoices from HubSpot CRM with pagination support
 */
export default async function getInvoices(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<InvoicesResponse> {
  const {
    limit = 10,
    after,
    properties,
    propertiesWithHistory,
    associations,
    archived,
  } = props;

  try {
    const client = new HubSpotClient(ctx);
    const response = await client.listObjects("invoices", {
      limit: Math.min(limit, 100),
      after,
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return {
      results: response.results || [],
      paging: response.paging,
    };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return {
      results: [],
    };
  }
}
