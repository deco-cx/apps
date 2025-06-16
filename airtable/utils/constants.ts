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

/**
 * OAuth Configuration
 */
export const OAUTH_SCOPES = [
  "data.records:read",
  "data.records:write",
  "schema.bases:read",
  "schema.bases:write",
  "user.email:read",
  "data.recordComments:read",
  "data.recordComments:write",
];

export const OAUTH_URL = "https://airtable.com/oauth2/v1";
export const OAUTH_URL_AUTH = "https://airtable.com/oauth2/v1/authorize";
export const OAUTH_URL_TOKEN = "https://airtable.com/oauth2/v1/token";
