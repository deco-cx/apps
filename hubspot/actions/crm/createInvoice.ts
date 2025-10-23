import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { Invoice, SimplePublicObjectInput } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Properties
   * @description Invoice properties as key-value pairs
   */
  properties: Record<string, string>;

  /**
   * @title Associations
   * @description List of associations to create with this invoice
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
 * @title Create Invoice
 * @description Create a new invoice in HubSpot CRM
 */
export default async function createInvoice(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Invoice> {
  const client = new HubSpotClient(ctx);

  const invoiceInput: SimplePublicObjectInput = {
    properties: props.properties,
    associations: props.associations,
  };

  const response = await client.createObject("invoices", invoiceInput);

  return response;
}
