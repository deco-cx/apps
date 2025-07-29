import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { ObjectProperty, ObjectPropertyInput } from "../../utils/types.ts";

export interface Props extends ObjectPropertyInput {
  /**
   * @title Object Type
   * @description The custom object type identifier
   */
  objectType: string;

  /**
   * @title Property Name
   * @description The name of the property (must be unique within the object)
   */
  name: string;

  /**
   * @title Property Label
   * @description The display label for the property
   */
  label: string;

  /**
   * @title Property Type
   * @description The data type of the property
   */
  type: "string" | "number" | "bool" | "datetime" | "date" | "enumeration";

  /**
   * @title Field Type
   * @description The field type for displaying the property
   */
  fieldType:
    | "text"
    | "textarea"
    | "number"
    | "date"
    | "select"
    | "radio"
    | "checkbox"
    | "file"
    | "booleancheckbox";

  /**
   * @title Description
   * @description Description of the property
   */
  description?: string;

  /**
   * @title Group Name
   * @description The property group this property belongs to
   */
  groupName?: string;

  /**
   * @title Options
   * @description Options for enumeration type properties
   */
  options?: Array<{
    label: string;
    value: string;
    description?: string;
    displayOrder?: number;
    hidden?: boolean;
  }>;

  /**
   * @title Display Order
   * @description The order in which to display this property
   */
  displayOrder?: number;

  /**
   * @title Has Unique Value
   * @description Whether this property must have unique values
   */
  hasUniqueValue?: boolean;

  /**
   * @title Hidden
   * @description Whether this property is hidden from the UI
   */
  hidden?: boolean;

  /**
   * @title Required
   * @description Whether this property is required
   */
  required?: boolean;
}

/**
 * @title Add Schema Property
 * @description Add a new property to a custom object schema
 */
export default async function addSchemaProperty(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ObjectProperty> {
  const client = new HubSpotClient(ctx);

  const { objectType, ...propertyInput } = props;

  const response = await client.post<ObjectProperty>(
    `/crm/v3/schemas/${objectType}/properties`,
    propertyInput,
  );

  return response;
}
