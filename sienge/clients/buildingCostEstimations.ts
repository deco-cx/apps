import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para planilhas de orçamento
export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface Sheet {
  id: number;
  description: string;
  status: "LOCKED" | "UNLOCKED";
}

export interface SheetItem {
  id: string;
  wbsCode: string;
  workItemId: number;
  description: string;
  unitOfMeasure: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  pricesByCategory: PriceByCategory[];
}

export interface PriceByCategory {
  category:
    | "EQUIPMENT"
    | "LABOR"
    | "INCREMENTAL_COST_ITEM"
    | "MATERIAL"
    | "TRANSPORT_ITEM"
    | "OTHER"
    | "OFFICE_SUPPLY"
    | "FUELS_AND_LUBRICANTS"
    | "MAINTENANCE_MATERIAL";
  unitPrice: number;
  totalPrice: number;
}

export interface SheetsResponse {
  resultSetMetadata: ResultSetMetadata;
  results: Sheet[];
}

export interface SheetItemsResponse {
  resultSetMetadata: ResultSetMetadata;
  results: SheetItem[];
}

export interface ApiError {
  status: string;
  developerMessage: string;
  userMessage?: string[];
}

// Interface do cliente de API
export interface BuildingCostEstimationsClient {
  "GET /building-cost-estimations/:buildingId/sheets": {
    response: SheetsResponse;
    searchParams?: {
      offset?: number;
      limit?: number;
    };
  };

  "GET /building-cost-estimations/:buildingId/sheets/:building_unit_id/items": {
    response: SheetItemsResponse;
    searchParams?: {
      offset?: number;
      limit?: number;
    };
  };
}

// Função para criar cliente da API
export function createBuildingCostEstimationsClient(state: State) {
  return createRestClient<BuildingCostEstimationsClient>(state);
}
