// deno-lint-ignore-file no-explicit-any
import {
  BatchUpdateRequest,
  Page,
  PageElement,
  Presentation,
  TokenResponse,
} from "./types.ts";

export interface GoogleAuthClient {
  "POST /token": {
    response: TokenResponse;
    searchParams: {
      code: string;
      client_id: string;
      client_secret: string;
      redirect_uri: string;
      grant_type: string;
    };
  };
}
// Client interface
export interface GoogleSlidesClient {
  "GET /v1/presentations/:presentationId": {
    response: Presentation;
    headers: {
      Authorization: string;
    };
  };

  "GET /v1/presentations": {
    response: Presentation[];
    headers: {
      Authorization: string;
    };
  };

  "POST /v1/presentations": {
    response: Presentation;
    body: {
      title?: string;
    };
  };

  "POST /v1/presentations/:presentationId": {
    response: {
      presentationId: string;
      replies: any[];
    };
    body: BatchUpdateRequest;
  };

  "GET /v1/presentations/:presentationId/pages/:pageObjectId": {
    response: Page;
  };

  // // Elements
  "POST /v1/presentations/:presentationId/pages/:pageObjectId/elements": {
    response: PageElement;
    body: {
      elementType: string;
      element: Partial<PageElement>;
    };
  };
}
