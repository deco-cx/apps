import {
  Actor,
  ActorRun,
  ActorRunsResponse,
  ActorsResponse,
  DatasetItemsQueryParams,
} from "./types.ts";

// Apify API client interface - simplified for Deco compatibility
export interface ApifyClient {
  // Run Actor - POST /v2/acts/:actorId/runs
  "POST /v2/acts/:actorId/runs": {
    response: ActorRun;
  };
  // Get list of runs - GET /v2/acts/:actorId/runs
  "GET /v2/acts/:actorId/runs": {
    searchParams: {
      limit?: number;
      offset?: number;
      status?: string;
      desc?: boolean;
    };
    response: ActorRunsResponse;
  };
  // Get run - GET /v2/acts/:actorId/runs/:runId
  "GET /v2/acts/:actorId/runs/:runId": {
    response: ActorRun;
  };
  // Get Actor - GET /v2/acts/:actorId
  "GET /v2/acts/:actorId": {
    response: Actor;
  };
  // Get list of Actors - GET /v2/acts
  "GET /v2/acts": {
    response: ActorsResponse;
  };
  "POST /v2/acts/:actorId/run-sync-get-dataset-items": {
    searchParams: {
      timeout?: number;
      memory?: number;
      build?: string;
    };
    body: unknown;
    response: Array<Record<string, unknown>>;
  };
  // Get dataset items - GET /v2/datasets/:datasetId/items
  "GET /v2/datasets/:datasetId/items": {
    searchParams: DatasetItemsQueryParams;
    // deno-lint-ignore no-explicit-any
    response: any;
  };
}
