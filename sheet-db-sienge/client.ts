// Define data types/interfaces for SheetDB API

// Type for sheet DB row based on provided example
export interface SheetDBRow {
  Código: string;
  Descrição: string;
  Quantidade: string;
  Unidade: string;
  "Data Cotação": string;
  Fornecedor: string;
  "Data Entrega": string;
  "IPI (%)": string;
  Subtotal: string;
  "Data de Entrega": string;
  [key: string]: string; // Allow for additional properties
}

// Response types
export interface CountResponse {
  rows: number;
}

export interface DocumentNameResponse {
  name: string;
}

// Query parameters for GET requests
export interface SheetDBQueryParams {
  sheet?: string;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc" | "random";
  sort_method?: string;
  sort_date_format?: string;
  cast_numbers?: string;
  single_object?: boolean;
  mode?: string;
}

// Parameters for POST requests
export interface CreateRowParams {
  sheet?: string;
  return_values?: boolean;
  mode?: string;
}

export interface CreateRowBody {
  data: SheetDBRow | SheetDBRow[];
}

// Define the client interface
export interface SheetDBClient {
  // Get all data from the spreadsheet
  "GET /": {
    response: SheetDBRow[];
    searchParams: SheetDBQueryParams;
  };

  // Get column names (keys)
  "GET /keys": {
    response: string[];
    searchParams: {
      sheet?: string;
    };
  };

  // Get document name
  "GET /name": {
    response: DocumentNameResponse;
  };

  // Get row count
  "GET /count": {
    response: CountResponse;
    searchParams: {
      sheet?: string;
    };
  };

  // Create rows
  "POST /": {
    response: { created: number } | SheetDBRow[];
    body: CreateRowBody;
    searchParams: CreateRowParams;
  };
} 