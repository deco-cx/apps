import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para indexadores
export interface IndexerValue {
  date: string;
  value: number;
  percentage: number;
}

export interface Indexer {
  id: number;
  name: string;
  revenueRetroactivity: number;
  lastValue?: IndexerValue;
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface IndexersResponse {
  resultSetMetadata: ResultSetMetadata;
  results: Indexer[];
}

// Interface do cliente de API
export interface IndexersClient {
  "GET /indexers": {
    response: IndexersResponse;
    searchParams?: {
      limit?: number;
      offset?: number;
    };
  };
}

// Função para criar cliente da API
export function createIndexersClient(state: State) {
  return createRestClient<IndexersClient>(state);
}
