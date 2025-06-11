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

export interface ListRecordsResponse {
  records: AirtableRecord[];
  offset?: string;
}

export interface CreateRecordBody {
  fields: FieldSet;
  typecast?: boolean;
}

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
  fields: Field[];
  primaryFieldId?: string;
}

export interface UpdateTableBody {
  name?: string;
  description?: string;
  primaryFieldId?: string;
}

export type CreateFieldBody = Omit<Field, "id">;

export interface UpdateFieldBody {
  name?: string;
  description?: string;
}

export interface AirtableBase {
  id: string;
  name?: string;
}

export interface AirtableTable {
  id: string;
  name?: string;
}

export interface WhoamiResponse {
  id: string;
  email?: string;
  scopes?: string[];
}
