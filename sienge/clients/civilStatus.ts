import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

export interface CivilStatus {
  id: number;
  description: string;
}

export interface EstCivilInsert {
  description: string;
  type: 1 | 2 | 3 | 4 | 5; // 1: Solteiro(a), 2: Casado(a), 3: Separado(a), 4: Divorciado(a), 5: Viúvo(a)
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface GetResponseDocument {
  resultSetMetadata: ResultSetMetadata;
  results: CivilStatus[];
}

export interface ResponseMessage {
  status?: number;
  developerMessage?: string;
  clientMessage?: string;
}

// Interface do cliente de API
export interface CivilStatusClient {
  "GET /civil-status": {
    response: GetResponseDocument;
    searchParams?: {
      limit?: number;
      offset?: number;
      description?: string;
    };
  };

  "POST /civil-status": {
    response: void;
    body: EstCivilInsert;
  };
}

// Função para criar cliente da API
export function createCivilStatusClient(state: State) {
  return createRestClient<CivilStatusClient>(state);
}
