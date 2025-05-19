import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para calendários de obra
export interface Calendar {
  projectStartDate: string;
  projectFinishDate: string;
  considerHolidaysAndDaysOffInGeneralRegister: boolean;
  considerSaturdaysAsWorkingDay: boolean;
  considerSundaysAsWorkingDay: boolean;
}

export interface PutCalendarResponse {
  projectStartDate: string;
  projectFinishDate: string;
}

export interface DayOff {
  date: string;
  description: string;
}

export interface DayOffForDelete {
  date: string;
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface DayOffsResponse {
  resultSetMetadata: ResultSetMetadata;
  results: DayOff[];
}

export interface ApiError {
  status: string;
  developerMessage: string;
  userMessage?: string[];
}

export interface ApiError422 extends ApiError {
  data: DayOff[];
}

// Interface do cliente de API
export interface BuildingCalendarClient {
  "GET /building-projects/:buildingId/calendar": {
    response: Calendar;
  };

  "PUT /building-projects/:buildingId/calendar": {
    response: PutCalendarResponse;
    body: Calendar;
  };

  "GET /building-projects/:buildingId/calendar/days-off": {
    response: DayOffsResponse;
    searchParams?: {
      offset?: number;
      limit?: number;
    };
  };

  "POST /building-projects/:buildingId/calendar/days-off": {
    response: void;
    body: DayOff[];
  };

  "DELETE /building-projects/:buildingId/calendar/days-off": {
    response: void;
    body: DayOffForDelete[];
  };
}

// Função para criar cliente da API
export function createBuildingCalendarClient(state: State) {
  return createRestClient<BuildingCalendarClient>(state);
}
