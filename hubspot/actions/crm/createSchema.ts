import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { CustomObjectInput, ObjectSchema } from "../../utils/types.ts";

export interface Props extends CustomObjectInput {
  /**
   * @title Object Name
   * @description The name of the custom object (must be unique)
   */
  name: string;

  /**
   * @title Labels
   * @description Display labels for the object
   */
  labels: {
    /**
     * @title Singular Label
     * @description Singular form of the object name
     */
    singular: string;

    /**
     * @title Plural Label
     * @description Plural form of the object name
     */
    plural: string;
  };

  /**
   * @title Description
   * @description Description of the custom object
   */
  description?: string;

  /**
   * @title Primary Display Property
   * @description The property to use as the primary display for the object
   */
  primaryDisplayProperty?: string;

  /**
   * @title Secondary Display Properties
   * @description Properties to display as secondary information
   */
  secondaryDisplayProperties?: string[];

  /**
   * @title Searchable Properties
   * @description Properties that should be searchable
   */
  searchableProperties?: string[];

  /**
   * @title Required Properties
   * @description Properties that are required when creating objects
   */
  requiredProperties?: string[];

  /**
   * @title Associated Objects
   * @description Object types that can be associated with this custom object
   */
  associatedObjects?: string[];
}

/**
 * @title Create Custom Object Schema
 * @description Create a new custom object schema (definition) in HubSpot CRM
 */
export default async function createSchema(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ObjectSchema> {
  const client = new HubSpotClient(ctx);

  const schemaInput: CustomObjectInput = {
    name: props.name,
    labels: props.labels,
    description: props.description,
    primaryDisplayProperty: props.primaryDisplayProperty,
    secondaryDisplayProperties: props.secondaryDisplayProperties,
    searchableProperties: props.searchableProperties,
    requiredProperties: props.requiredProperties,
    properties: props.properties,
    associatedObjects: props.associatedObjects,
  };

  const response = await client.post<ObjectSchema>(
    "/crm/v3/schemas",
    schemaInput,
  );

  return response;
}
