import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para reservas de unidades
export interface UnitBooking {
  enterpriseId: number;
  unitId: number;
  brokerId: number;
  customerId?: number;
  validityDate?: string;
  note?: string;
}

export interface ResponseMessage {
  status?: number;
  developerMessage?: string;
  clientMessage?: string;
}

// Interface do cliente de API
export interface UnitBookingsClient {
  "POST /unit-bookings": {
    response: void;
    body: UnitBooking;
  };

  "PATCH /unit-bookings/units/:id/deactivate": {
    response: void;
  };
}

// Função para criar cliente da API
export function createUnitBookingsClient(state: State) {
  return createRestClient<UnitBookingsClient>(state);
}
