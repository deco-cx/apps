import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para bens móveis
export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface MovableAsset {
  patrimonyId: number;
  detail?: string;
  prefix?: string;
  brand?: string;
  model?: string;
  observation?: string;
  barCode?: string;
  costCenter?: number;
  plateId?: string;
  situation?: string;
  preservation?: string;
  color?: string;
  useFuel?: boolean;
  fuel?: string;
  serialNumber?: string;
  modelYear?: string;
  manufactureYear?: number;
  initialDepartment?: string;
  actualDepartment?: string;
  incorporationForm?: string;
  incorporationDate?: string;
  incorporationValue?: number;
  incorporationNoteNumber?: string;
  incorporationProvider?: number;
  accountancyIncorporationAccount?: string;
  accountancyIdentity?: string;
  accountancyOrigin?: string;
  accountancyUsageIndicator?: string;
  accountancyLifetime?: number;
  depreciationInitialDate?: string;
  depreciationDebitAccount?: string;
  depreciationCreditAccount?: string;
  depreciationValue?: number;
  depreciationLastDate?: string;
  depreciationActualValue?: number;
}

export interface MovableAssetsResponse {
  resultSetMetadata: ResultSetMetadata;
  results: MovableAsset[];
}

export interface ApiError {
  status: string;
  developerMessage: string;
  userMessage?: string[];
}

// Interface do cliente de API
export interface MovableAssetsClient {
  "GET /patrimony/movable": {
    response: MovableAssetsResponse;
    searchParams?: {
      patrimonyId?: number;
      barCode?: string;
      costCenter?: string;
      model?: number;
      plateId?: string;
      situation?: "A" | "B";
      offset?: number;
      limit?: number;
    };
  };
}

// Função para criar cliente da API
export function createMovableAssetsClient(state: State) {
  return createRestClient<MovableAssetsClient>(state);
}
