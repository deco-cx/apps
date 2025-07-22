import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { SimplePublicObject } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Product ID
   * @description The ID of the product to retrieve
   */
  productId: string;

  /**
   * @title Properties
   * @description A comma-separated list of product properties to return
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
   * @description Whether to return archived products
   */
  archived?: boolean;
}

/**
 * @title Get Product
 * @description Retrieve a specific product from HubSpot CRM by ID
 */
export default async function getProduct(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject | null> {
  const {
    productId,
    properties,
    propertiesWithHistory,
    associations,
    archived,
  } = props;

  try {
    const client = new HubSpotClient(ctx);
    const product = await client.getObject("products", productId, {
      properties,
      propertiesWithHistory,
      associations,
      archived,
    });

    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}
