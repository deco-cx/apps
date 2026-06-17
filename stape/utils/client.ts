import { CapiGateway, Container, StapeGateway } from "./types.ts";

export interface StapeClient {
  // Container management
  "GET /api/v2/containers": {
    response: Container[];
  };
  "POST /api/v2/containers": {
    body: {
      name: string;
      zone: string;
      plan?: string;
    };
    response: Container;
  };
  "GET /api/v2/containers/:identifier": {
    response: Container;
  };
  "PUT /api/v2/containers/:identifier": {
    body: Partial<Container>;
    response: Container;
  };
  "DELETE /api/v2/containers/:identifier": {
    response: void;
  };

  // CAPI Gateways (Meta/Facebook Ads)
  "GET /api/v2/capi-gateways": {
    response: CapiGateway[];
  };
  "POST /api/v2/capi-gateways": {
    body: {
      name: string;
      zone: string;
      plan?: string;
    };
    response: CapiGateway;
  };
  "GET /api/v2/capi-gateways/:identifier": {
    response: CapiGateway;
  };

  // Stape Gateways (Custom tracking)
  "GET /api/v2/stape-gateways": {
    response: StapeGateway[];
  };
  "POST /api/v2/stape-gateways": {
    body: {
      name: string;
      zone: string;
      plan?: string;
    };
    response: StapeGateway;
  };
  "GET /api/v2/stape-gateways/:identifier": {
    response: StapeGateway;
  };

  // Account info
  "GET /api/v2/account": {
    response: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
}
