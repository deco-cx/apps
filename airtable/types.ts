export interface FieldSet {
  [key: string]: unknown; // Fields can be of various types
}

export interface AirtableRecord {
  id: string;
  createdTime?: string; // Optional, as it's not in all responses like listRecords minimal
  fields: FieldSet;
}

// Based on IAirtableService and common Airtable field structure
export interface Field {
  id?: string; // Present when returned, optional or omitted when creating
  name: string;
  type: string; // e.g., 'singleLineText', 'multipleSelects', 'number', 'formula'
  description?: string;
  options?: unknown; // For specific field types like 'select' or 'multipleSelects'
}

// Based on IAirtableService and common Airtable table structure
export interface Table {
  id: string;
  name: string;
  fields: Field[];
  primaryFieldId?: string;
  description?: string;
  views?: Array<{
    id: string;
    name: string;
    type: string; // e.g., 'grid', 'calendar', 'kanban'
  }>;
}

// Based on IAirtableService for listBases
export interface ListBasesResponse {
  bases: Array<{
    id: string;
    name: string;
    permissionLevel: string;
  }>;
  offset?: string;
}

// Based on IAirtableService for getBaseSchema
export interface BaseSchemaResponse {
  tables: Table[];
  offset?: string;
}

// Based on IAirtableService and AirtableService ListRecordsOptions
export interface ListRecordsOptions {
  fields?: string[];
  filterByFormula?: string;
  maxRecords?: number;
  pageSize?: number;
  sort?: Array<{
    field: string;
    direction?: "asc" | "desc";
  }>;
  view?: string;
  cellFormat?: "json" | "string";
  timeZone?: string;
  userLocale?: string;
  offset?: string;
  returnFieldsByFieldId?: boolean;
}

// Specific type for the response of listing records
export interface ListRecordsResponse {
  records: AirtableRecord[];
  offset?: string;
}

// For creating a single record
export interface CreateRecordBody {
  fields: FieldSet;
  typecast?: boolean;
}

// For updating records
export interface UpdateRecordsBody {
  records: Array<{ id: string; fields: FieldSet }>;
  typecast?: boolean;
  performUpsert?: {
    fieldsToMergeOn: string[];
  };
}

// For creating a table
export interface CreateTableBody {
  name: string;
  description?: string;
  fields: Field[]; // The service method uses Field[] which implies id might not be there for new fields.
  // However, Airtable API expects field definitions.
  // Let's assume Field might have id undefined for new ones.
  primaryFieldId?: string; // Or fieldIdToPrimaryFieldId depending on API version/docs.
  // The service used `fields: Field[]` without primary field explicit in params.
  // It's usually part of the fields definitions or a separate param.
}

// For updating a table
export interface UpdateTableBody {
  name?: string;
  description?: string;
  primaryFieldId?: string;
}

// For creating a field (Omit 'id' as it's generated)
export type CreateFieldBody = Omit<Field, "id">;

// For updating a field
export interface UpdateFieldBody {
  name?: string;
  description?: string;
  // type?: string; // Type changes are complex and might not be supported or have caveats
  // options?: unknown;
}

// Secret type from NewAppPrompt
export interface Secret {
  get: () => string;
}
