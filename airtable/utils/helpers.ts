import type {
  FieldSet,
  ListRecordsOptions,
  PermissionParams,
} from "./types.ts";

/**
 * Utility functions for Airtable operations
 */

/**
 * Validates if a record ID follows Airtable's format
 */
export function isValidRecordId(recordId: string): boolean {
  return /^rec[a-zA-Z0-9]{14}$/.test(recordId);
}

/**
 * Validates if a base ID follows Airtable's format
 */
export function isValidBaseId(baseId: string): boolean {
  return /^app[a-zA-Z0-9]{14}$/.test(baseId);
}

/**
 * Validates if a table ID follows Airtable's format
 */
export function isValidTableId(tableId: string): boolean {
  return /^tbl[a-zA-Z0-9]{14}$/.test(tableId);
}

/**
 * Validates if a field ID follows Airtable's format
 */
export function isValidFieldId(fieldId: string): boolean {
  return /^fld[a-zA-Z0-9]{14}$/.test(fieldId);
}

/**
 * Builds a filter formula for Airtable API
 */
export function buildFilterFormula(filters: Record<string, unknown>): string {
  const conditions = Object.entries(filters).map(([field, value]) => {
    if (typeof value === "string") {
      return `{${field}} = "${value}"`;
    } else if (typeof value === "number") {
      return `{${field}} = ${value}`;
    } else if (typeof value === "boolean") {
      return `{${field}} = ${value ? "TRUE" : "FALSE"}`;
    }
    return `{${field}} = "${String(value)}"`;
  });

  return conditions.length > 1
    ? `AND(${conditions.join(", ")})`
    : conditions[0] || "";
}

/**
 * Sanitizes field names for Airtable API
 */
export function sanitizeFieldName(fieldName: string): string {
  return fieldName.trim().replace(/[^\w\s-]/g, "");
}

/**
 * Validates field set data
 */
export function validateFieldSet(fields: FieldSet): boolean {
  return typeof fields === "object" && fields !== null &&
    !Array.isArray(fields);
}

/**
 * Builds sort parameters for list records options
 */
export function buildSortParams(
  sortField: string,
  direction: "asc" | "desc" = "asc",
): ListRecordsOptions["sort"] {
  return [{ field: sortField, direction }];
}

/**
 * Extracts record ID from Airtable URL
 */
export function extractRecordIdFromUrl(url: string): string | null {
  const match = url.match(/rec[a-zA-Z0-9]{14}/);
  return match ? match[0] : null;
}

/**
 * Extracts base ID from Airtable URL
 */
export function extractBaseIdFromUrl(url: string): string | null {
  const match = url.match(/app[a-zA-Z0-9]{14}/);
  return match ? match[0] : null;
}

/**
 * Maps table fields to the format expected by Airtable API
 */
export function mapTableFields(
  fields: Array<{
    name: string;
    type: string;
    description?: string;
    options?: {
      choices?: Array<{
        name: string;
        color?: string;
      }>;
    };
  }>,
): Array<{
  name: string;
  type: string;
  description?: string;
  options?: {
    choices?: Array<{
      name: string;
      color?: string;
    }>;
  };
}> {
  return fields.map((field) => {
    const mappedField: {
      name: string;
      type: string;
      description?: string;
      options?: {
        choices?: Array<{
          name: string;
          color?: string;
        }>;
      };
    } = {
      name: field.name,
      type: field.type,
    };

    if (field.description) {
      mappedField.description = field.description;
    }

    if (field.options) {
      mappedField.options = field.options;
    }

    return mappedField;
  });
}

export const decodePermission = (permission: string): PermissionParams => {
  const permissionData = JSON.parse(atob(permission));
  return permissionData as PermissionParams;
};
