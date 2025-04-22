import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para departamentos
export interface Department {
  departmentId: number;
  departmentName: string;
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface DepartmentsResponse {
  resultSetMetadata: ResultSetMetadata;
  results: Department[];
}

// Interface do cliente de API
export interface DepartmentsClient {
  "GET /departments": {
    response: DepartmentsResponse;
    searchParams?: {
      limit?: number;
      offset?: number;
    };
  };

  "GET /departments/:departmentId": {
    response: Department;
  };
}

// Função para criar cliente da API
export function createDepartmentsClient(state: State) {
  return createRestClient<DepartmentsClient>(state);
}
