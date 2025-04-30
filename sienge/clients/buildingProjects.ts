import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Types for building project tasks
export interface Task {
  id: number;
  presentationId?: number;
  description: string;
  level: number;
  startDate?: string;
  finishDate?: string;
  plannedExecutions?: {
    year: number;
    month: number;
    plannedPercentage: number;
  }[];
  costItems?: {
    sheetItemId: string;
    costRatio: number;
  }[];
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface GetResponseTask {
  resultSetMetadata: ResultSetMetadata;
  results: Task[];
}

// API client interface
export interface BuildingProjectsClient {
  "GET /building-projects/:buildingId/sheets/:buildingUnitId/tasks": {
    response: GetResponseTask;
    searchParams?: {
      limit?: number;
      offset?: number;
    };
  };

  "PUT /building-projects/:buildingId/sheets/:buildingUnitId/tasks": {
    response: void;
    body: Task[];
    searchParams?: {
      allowDeleteTaskCostItem?: boolean;
    };
  };
}

// Function to create API client
export function createBuildingProjectsClient(state: State) {
  return createRestClient<BuildingProjectsClient>(state);
}
