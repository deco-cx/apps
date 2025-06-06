import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para parâmetros
export interface ParameterDTO {
  id: number;
  value: string;
}

export interface ApiError {
  code: string;
  message: string;
}

// Interface do cliente de API
export interface ParametersClient {
  "GET /parameters/:id": {
    response: ParameterDTO;
  };
}

// Função para criar cliente da API
export function createParametersClient(state: State) {
  return createRestClient<ParametersClient>(state);
}
