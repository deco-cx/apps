import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para empresas
export interface Company {
  id: number;
  name: string;
  tradeName?: string;
  cnpj?: string;
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface CompaniesResponse {
  resultSetMetadata: ResultSetMetadata;
  results: Company[];
}

// Interface do cliente de API
export interface CompaniesClient {
  "GET /companies": {
    response: CompaniesResponse;
    searchParams?: {
      limit?: number;
      offset?: number;
    };
  };

  "GET /companies/:companyId": {
    response: Company;
  };
}

// Função para criar cliente da API
export function createCompaniesClient(state: State) {
  return createRestClient<CompaniesClient>(state);
}
