import {
  Calendar,
  CalendarList,
  CalendarListParams,
  CreateEventParams,
  Event,
  EventsList,
  EventsListParams,
  Example,
  UpdateEventParams,
} from "./types.ts";

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
  "GET /calendars/:calendarId/events": {
    response: EventsList;
    searchParams: Omit<EventsListParams, "calendarId">;
  };
  "GET /calendars/:calendarId/events/:eventId": {
    response: Event;
    searchParams?: {
      /** The maximum number of attendees to include in the response. */
      maxAttendees?: number;
      /** The time zone used in the response. Default is the calendar's time zone. */
      timeZone?: string;
      /** Whether to always include a value in the email field for the organizer, creator and attendees. */
      alwaysIncludeEmail?: boolean;
    };
  };
  "POST /calendars/:calendarId/events": {
    response: Event;
    searchParams: Omit<CreateEventParams, "calendarId">;
    body: Event;
  };
  "PUT /calendars/:calendarId/events/:eventId": {
    response: Event;
    searchParams: Omit<UpdateEventParams, "calendarId" | "eventId">;
    body: Event;
  };
  "PATCH /calendars/:calendarId/events/:eventId": {
    response: Event;
    searchParams: Omit<UpdateEventParams, "calendarId" | "eventId">;
    body: Partial<Event>;
  };
  "DELETE /calendars/:calendarId/events/:eventId": {
    response: void;
    searchParams?: {
      /** Whether to send notifications about the deletion of the event. Default is false. */
      sendNotifications?: boolean;
      /** Guests who should receive notifications about the deletion of the event. */
      sendUpdates?: "all" | "externalOnly" | "none";
    };
  };
  "POST /calendars/:calendarId/events/quickAdd": {
    response: Event;
    searchParams: {
      /** Text describing the event. */
      text: string;
      /** Whether to send notifications about the creation of the new event. Default is false. */
      sendNotifications?: boolean;
    };
  };
  "POST /calendars/:calendarId/events/:eventId/move": {
    response: Event;
    searchParams: {
      /** Calendar identifier of the target calendar where the event is to be moved to. */
      destination: string;
      /** Whether to send notifications about the change of the event's organizer. Default is false. */
      sendNotifications?: boolean;
    };
  };
  "GET /calendars/:calendarId/events/:eventId/instances": {
    response: EventsList;
    searchParams?: {
      /** Maximum number of attendees to include in the response. */
      maxAttendees?: number;
      /** Maximum number of events returned. Default is 250, max is 2500. */
      maxResults?: number;
      /** Token specifying which page of results to return. */
      pageToken?: string;
      /** Whether to include deleted events. Default is false. */
      showDeleted?: boolean;
      /** Lower bound for an event's start time to filter by. RFC3339 timestamp. */
      timeMin?: string;
      /** Upper bound for an event's start time to filter by. RFC3339 timestamp. */
      timeMax?: string;
      /** Time zone used in the response. Default is the calendar's time zone. */
      timeZone?: string;
    };
  };
  "POST /freeBusy": {
    response: {
      kind: string;
      timeMin: string;
      timeMax: string;
      calendars: Record<string, {
        busy: Array<{
          start: string;
          end: string;
        }>;
        errors?: Array<{
          domain: string;
          reason: string;
        }>;
      }>;
      groups: Record<string, {
        calendars: string[];
        errors?: Array<{
          domain: string;
          reason: string;
        }>;
      }>;
    };
    body: {
      timeMin: string;
      timeMax: string;
      timeZone?: string;
      calendarExpansionMax?: number;
      groupExpansionMax?: number;
      items: Array<{ id: string }>;
    };
  };
}
