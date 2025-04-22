import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para tipos de condição de pagamento
export interface PaymentConditionType {
  id: number;
  description: string;
  finalityType?: string;
  interval?: number;
  intervalType?: string;
  installmentsNumber?: number;
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface PaymentConditionTypesResponse {
  resultSetMetadata: ResultSetMetadata;
  results: PaymentConditionType[];
}

// Interface do cliente de API
export interface PaymentConditionTypesClient {
  "GET /payment-condition-types": {
    response: PaymentConditionTypesResponse;
    searchParams?: {
      filter?: string;
      offset?: number;
      limit?: number;
    };
  };
}

// Função para criar cliente da API
export function createPaymentConditionTypesClient(state: State) {
  return createRestClient<PaymentConditionTypesClient>(state);
}
