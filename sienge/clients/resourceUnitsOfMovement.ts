import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para unidades de movimento
export interface UnitOfMovement {
  id: number;
  isDefault: boolean;
  conversionFactor: number;
  unitOfMeasureId: number;
  unitOfMeasureSymbol: string;
  unitOfMeasureDescription: string;
  resourceId: number;
  resourceDescription: string;
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface UnitsOfMovementResponse {
  resultSetMetadata: ResultSetMetadata;
  results: UnitOfMovement[];
}

export interface ApiError {
  status: string;
  developerMessage: string;
  userMessage?: string[];
}

// Interface do cliente de API
export interface ResourceUnitsOfMovementClient {
  "GET /building-cost-estimations/:buildingId/resource-units-of-movement": {
    response: UnitsOfMovementResponse;
    searchParams?: {
      resourceId?: number;
      offset?: number;
      limit?: number;
    };
  };
}

// Função para criar cliente da API
export function createResourceUnitsOfMovementClient(state: State) {
  return createRestClient<ResourceUnitsOfMovementClient>(state);
}
