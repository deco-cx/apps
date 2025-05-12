// Types for a row in the SheetDB NPS spreadsheet
export interface SheetDbNpsRow {
  Avaliação: string;
  Categoria: string;
  "E-mail": string;
  Nota: string;
  "Motivo de contato": string;
  "Mes referencia (viagem)": string;
  Origem: string;
  Destino: string;
  "Data viagem": string;
  "Empresa venda": string;
  "Classe de serviço": string;
  Classe: string;
  Trecho: string;
  "Mes referencia (resposta)": string;
  "Data resposta": string;
  Token: string;
  [key: string]: string; // For any extra columns
}

// Query/search parameters for GET / and /search endpoints
export interface SheetDbNpsQuery {
  sheet?: string;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc" | "random";
  sort_method?: string;
  sort_date_format?: string;
  cast_numbers?: string;
  single_object?: boolean;
  mode?: "FORMATTED_VALUE" | "UNFORMATTED_VALUE" | "FORMULA";
}

// Search parameters for /search and /search_or
export type SheetDbNpsSearchParams = Record<string, string | number | (string | number)[]> & Partial<SheetDbNpsQuery>;

export interface SheetDbNpsClient {
  /**
   * Get all rows from the spreadsheet
   */
  "GET /": {
    response: SheetDbNpsRow[];
    searchParams?: SheetDbNpsQuery;
  };

  /**
   * Search for rows matching all conditions
   */
  "GET /search": {
    response: SheetDbNpsRow[];
    searchParams: SheetDbNpsSearchParams;
  };

  /**
   * Search for rows matching any condition
   */
  "GET /search_or": {
    response: SheetDbNpsRow[];
    searchParams: SheetDbNpsSearchParams;
  };

  /**
   * List all available sheets (tabs)
   */
  "GET /sheets": {
    response: { sheets: string[] };
  };
} 