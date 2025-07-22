import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { Invoice } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Invoice ID
   * @description The ID of the invoice to retrieve
   */
  invoiceId: string;

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
 * @title Get Invoice
 * @description Retrieve a specific invoice by ID from HubSpot CRM
 */
export default async function getInvoice(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Invoice | null> {
  const {
    invoiceId,
    properties,
    propertiesWithHistory,
    associations,
    archived,
  } = props;

  try {
    const client = new HubSpotClient(ctx);
    const invoice = await client.getObject("invoices", invoiceId, {
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return invoice;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }
}
