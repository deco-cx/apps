import type {
  AirtableRecord,
  BaseSchemaResponse,
  CreateFieldBody,
  CreateRecordBody,
  CreateTableBody,
  Field,
  ListBasesResponse,
  ListRecordsOptions,
  ListRecordsResponse,
  Table,
  UpdateFieldBody,
  UpdateRecordsBody,
  UpdateTableBody,
  WhoamiResponse,
} from "./types.ts";

export interface AirtableClient {
  /**
   * Get current user
   * @see https://airtable.com/developers/web/api/get-user-id-scopes
   */
  "GET /v0/meta/whoami": {
    response: WhoamiResponse;
  };

  /**
   * List bases
   * @see https://airtable.com/developers/web/api/list-bases
   */
  "GET /v0/meta/bases": {
    response: ListBasesResponse;
    searchParams?: { offset?: string };
  };

  /**
   * Get base schema
   * @see https://airtable.com/developers/web/api/get-base-schema
   */
  "GET /v0/meta/bases/:baseId/tables": {
    response: BaseSchemaResponse;
    searchParams?: { offset?: string };
  };

  /**
   * List records
   * @see https://airtable.com/developers/web/api/list-records
   */
  "GET /v0/:baseId/:tableId": {
    response: ListRecordsResponse;
    searchParams?: ListRecordsOptions;
  };

  /**
   * Retrieve a record
   * @see https://airtable.com/developers/web/api/get-record
   */
  "GET /v0/:baseId/:tableId/:recordId": {
    response: AirtableRecord;
  };

  /**
   * Create records
   * NOTE: Airtable API allows creating multiple records (up to 10). This client method is for a single record for simplicity to match service layer.
   * For batch creation, the service method `createRecord` would call this and wrap it in an array if needed, or a separate client method for batch could be made.
   * Let's define it for creating a single record as per the IAirtableService.createRecord
   * @see https://airtable.com/developers/web/api/create-records
   */
  "POST /v0/:baseId/:tableId": {
    body: CreateRecordBody; // { fields: FieldSet, typecast?: boolean }
    response: AirtableRecord;
  };

  /**
   * Update records
   * @see https://airtable.com/developers/web/api/update-records
   */
  "PATCH /v0/:baseId/:tableId": {
    body: UpdateRecordsBody; // { records: Array<{ id: string; fields: FieldSet }>, typecast?: boolean, performUpsert?: ... }
    response: { records: AirtableRecord[] }; // API returns the updated records
  };

  /**
   * Delete records
   * @see https://airtable.com/developers/web/api/delete-records
   */
  "DELETE /v0/:baseId/:tableId": {
    searchParams: { "records[]": string[] }; // records[]=recXXXXX&records[]=recYYYYY
    response: { records: Array<{ id: string; deleted: boolean }> };
  };

  /**
   * Create table
   * @see https://airtable.com/developers/web/api/create-table (Metadata API)
   */
  "POST /v0/meta/bases/:baseId/tables": {
    body: CreateTableBody; // { name: string, description?: string, fields: Field[], primaryFieldId?: string }
    response: Table;
  };

  /**
   * Update table
   * @see https://airtable.com/developers/web/api/update-table (Metadata API)
   */
  "PATCH /v0/meta/bases/:baseId/tables/:tableId": {
    body: UpdateTableBody; // { name?: string, description?: string, primaryFieldId?: string }
    response: Table;
  };

  /**
   * Create field
   * Part of Airtable Metadata API.
   */
  "POST /v0/meta/bases/:baseId/tables/:tableId/fields": {
    body: CreateFieldBody; // Omit<Field, "id">
    response: Field; // Returns the full Field object with id
  };

  /**
   * Update field
   * Part of Airtable Metadata API.
   */
  "PATCH /v0/meta/bases/:baseId/tables/:tableId/fields/:fieldId": {
    body: UpdateFieldBody; // { name?: string, description?: string }
    response: Field; // Returns the full Field object
  };

  /**
   * Create base
   * @see https://airtable.com/developers/web/api/create-base
   */
  "POST /v0/meta/bases": {
    body: {
      name: string;
      workspaceId: string;
      tables: Array<{
        name: string;
        description?: string;
        fields: Array<{
          name: string;
          type: string;
          description?: string;
          options?: {
            choices?: Array<{
              name: string;
              color?: string;
            }>;
            color?: string;
            icon?: string;
          };
        }>;
      }>;
    };
    response: { id: string; tables: Table[] };
  };
}
