import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

export interface Cities {
  id: number;
  name: string;
  state: {
    id: number;
    name: string;
    code: string;
  };
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface GetResponseDocument {
  resultSetMetadata: ResultSetMetadata;
  results: Cities[];
}

export interface ResponseMessage {
  status?: number;
  developerMessage?: string;
  clientMessage?: string;
}

// Interface do cliente de API
export interface CitiesClient {
  "GET /cities": {
    response: GetResponseDocument;
    searchParams?: {
      limit?: number;
      offset?: number;
      name?: string;
      stateCode?: string;
    };
  };
}

// Função para criar cliente da API
export function createCitiesClient(state: State) {
  return createRestClient<CitiesClient>(state);
}
