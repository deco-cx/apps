// Apify API client interface - simplified for Deco compatibility
export interface ApifyClient {
  // Run Actor - POST /v2/acts/:actorId/runs
  "POST /v2/acts/:actorId/runs": {
    response: any;
  };
  // Get list of runs - GET /v2/acts/:actorId/runs  
  "GET /v2/acts/:actorId/runs": {
    response: any;
  };
  // Get run - GET /v2/acts/:actorId/runs/:runId
  "GET /v2/acts/:actorId/runs/:runId": {
    response: any;
  };
  // Get Actor - GET /v2/acts/:actorId  
  "GET /v2/acts/:actorId": {
    response: any;
  };
  // Get list of Actors - GET /v2/acts
  "GET /v2/acts": {
    response: any;
  };
}
// Common Apify types
export interface ActorRun {
  id: string;
  actId: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
  output?: {
    items?: Array<Record<string, unknown>>;
  };
}

export interface Actor {
  id: string;
  name: string;
  username: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  modifiedAt: string;
}
