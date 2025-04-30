import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para tipos de imóveis
export interface PropertyType {
  id: number;
  name: string;
  residential: boolean;
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface PropertyTypesResponse {
  resultSetMetadata: ResultSetMetadata;
  results: PropertyType[];
}

// Interface do cliente de API
export interface PropertyTypesClient {
  "GET /property-types": {
    response: PropertyTypesResponse;
    searchParams?: {
      limit?: number;
      offset?: number;
      name?: string;
    };
  };

  "GET /property-types/:id": {
    response: PropertyTypesResponse;
  };
}

// Função para criar cliente da API
export function createPropertyTypesClient(state: State) {
  return createRestClient<PropertyTypesClient>(state);
}
