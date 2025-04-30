import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para tipos de clientes
export interface CustomerType {
  id: number;
  description: string;
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface CustomerTypesResponse {
  resultSetMetadata: ResultSetMetadata;
  results: CustomerType[];
}

// Interface do cliente de API
export interface CustomerTypesClient {
  "GET /customer-types": {
    response: CustomerTypesResponse;
    searchParams?: {
      limit?: number;
      offset?: number;
      id?: number;
      description?: string;
    };
  };
}

// Função para criar cliente da API
export function createCustomerTypesClient(state: State) {
  return createRestClient<CustomerTypesClient>(state);
}
