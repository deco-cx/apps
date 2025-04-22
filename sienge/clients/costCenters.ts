import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para centros de custo
export interface CostCenter {
  id: number;
  name: string;
  idCompany: number;
  cnpj?: string;
}

export interface DetailedCostCenter extends CostCenter {
  buildingSectors?: BuildingSector[];
}

export interface DetailedCostCenterAvailable extends CostCenter {
  availables?: Available[];
}

export interface BuildingSector {
  id: string;
  name: string;
  accountableId?: string;
  accountableName?: string;
}

export interface Available {
  accountNumber: string;
  accountName: string;
}

export interface ImmediateRegisterSettings {
  costCenterId: number;
  companyId: number;
  accountNumber: string;
  registerType: string;
  receiveCondition: string;
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface CostCentersResponse {
  resultSetMetadata: ResultSetMetadata;
  results: CostCenter[];
}

export interface ResponseMessage {
  status?: number;
  developerMessage?: string;
  clientMessage?: string;
}

// Interface do cliente de API
export interface CostCentersClient {
  "GET /cost-centers": {
    response: CostCentersResponse;
    searchParams?: {
      limit?: number;
      offset?: number;
    };
  };

  "GET /cost-centers/:costCenterId": {
    response: DetailedCostCenter;
  };

  "GET /cost-centers/:costCenterId/available": {
    response: DetailedCostCenterAvailable;
  };

  "GET /cost-centers/immediate-register-settings": {
    response: ImmediateRegisterSettings;
    searchParams: {
      costCenterId: number;
    };
  };
}

// Função para criar cliente da API
export function createCostCentersClient(state: State) {
  return createRestClient<CostCentersClient>(state);
}
