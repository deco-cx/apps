import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para profissões
export interface Profession {
  id: number;
  name: string;
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface ProfessionsResponse {
  resultSetMetadata: ResultSetMetadata;
  results: Profession[];
}

// Interface do cliente de API
export interface ProfessionsClient {
  "GET /professions": {
    response: ProfessionsResponse;
    searchParams?: {
      limit?: number;
      offset?: number;
      name?: string;
    };
  };

  "POST /professions": {
    response: void;
    body: string[];
  };

  "GET /professions/:id": {
    response: ProfessionsResponse;
  };
}

// Função para criar cliente da API
export function createProfessionsClient(state: State) {
  return createRestClient<ProfessionsClient>(state);
}
