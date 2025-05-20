import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para locais de obra
export interface Site {
  id: number;
  description: string;
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface SitesResponse {
  resultSetMetadata: ResultSetMetadata;
  results: Site[];
}

// Interface do cliente de API
export interface SitesClient {
  "GET /sites": {
    response: SitesResponse;
    searchParams: {
      buildingId: string;
      limit?: number;
      offset?: number;
    };
  };
}

// Função para criar cliente da API
export function createSitesClient(state: State) {
  return createRestClient<SitesClient>(state);
}
