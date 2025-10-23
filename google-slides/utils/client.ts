import { Page, PageElement, Presentation } from "./types.ts";

export interface AuthClient {
  "POST /token": {
    searchParams: {
      grant_type: string;
      code?: string;
      refresh_token?: string;
      client_id: string;
      client_secret: string;
      redirect_uri?: string;
    };
    response: {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      token_type?: string;
      scope?: string;
    };
  };
}
export interface Client {
  "GET /presentations/:presentationId": {
    response: Presentation;
    headers: {
      Authorization: string;
    };
  };

  "GET /presentations": {
    response: Presentation[];
    headers: {
      Authorization: string;
    };
  };

  "POST /presentations": {
    response: Presentation;
    body: {
      title?: string;
    };
  };

  "GET /presentations/:presentationId/pages/:pageObjectId": {
    response: Page;
  };

  // // Elements
  "POST /presentations/:presentationId/pages/:pageObjectId/elements": {
    response: PageElement;
    body: {
      elementType: string;
      element: Partial<PageElement>;
    };
  };
}
