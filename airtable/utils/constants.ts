/**
 * Airtable API Constants
 */

export const AIRTABLE_API_BASE_URL = "https://api.airtable.com";
export const AIRTABLE_API_VERSION = "v0";

/**
 * API Endpoints
 */
export const ENDPOINTS = {
  BASES: "/v0/meta/bases",
  BASE_SCHEMA: "/v0/meta/bases/:baseId/tables",
  RECORDS: "/v0/:baseId/:tableIdOrName",
  RECORD: "/v0/:baseId/:tableIdOrName/:recordId",
  TABLES: "/v0/meta/bases/:baseId/tables",
  TABLE: "/v0/meta/bases/:baseId/tables/:tableId",
  FIELDS: "/v0/meta/bases/:baseId/tables/:tableId/fields",
  FIELD: "/v0/meta/bases/:baseId/tables/:tableId/fields/:fieldId",
} as const;

/**
 * Default headers for Airtable API requests
 */
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
} as const;

/**
 * Maximum records per request
 */
export const MAX_RECORDS_PER_REQUEST = 100;

/**
 * Maximum records for batch operations
 */
export const MAX_BATCH_RECORDS = 10; 