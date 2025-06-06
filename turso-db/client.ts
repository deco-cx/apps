// Types for Turso DB HTTP API client

// Data type definitions
export interface TursoResponse {
  results: Array<{
    // SQLite result fields
    columns?: string[];
    // deno-lint-ignore no-explicit-any
    rows?: Array<Array<any>>;
    affected_row_count?: number;
    last_insert_rowid?: string;
    error?: {
      message: string;
      code: string;
    };
  }>;
}

// Parameter type for SQL queries
export interface SQLParameter {
  type: "text" | "integer" | "float" | "blob" | "null";
  value: string | number | null;
}

// Client interface following the pattern expected by createHttpClient
export interface TursoClient {
  "POST /v2/pipeline": {
    response: TursoResponse;
    body: {
      requests: Array<{
        type: "execute" | "close";
        stmt?: {
          sql: string;
          args?: SQLParameter[];
        };
      }>;
    };
  };
}
