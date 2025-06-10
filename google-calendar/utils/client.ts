import { Calendar, CalendarList, CalendarListParams, Example } from "./types.ts";

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
  "POST /v4/example": {
    response: Example;
    searchParams: {
      ranges: string[];
      majorDimension?: string;
      valueRenderOption?: string;
      dateTimeRenderOption?: string;
    };
    body: {
      properties: {
        title: string;
        locale?: string;
        autoRecalc?: string;
        timeZone?: string;
      };
      example?: {
        properties: {
          title: string;
        };
      }[];
    };
  };
  "GET /users/me/calendarList": {
    response: CalendarList;
    searchParams: CalendarListParams;
  };
  "GET /calendars/:calendarId": {
    response: Calendar;
  };
}
