export interface Example {
  example: {
    properties: {
      title: string;
    };
  }[];
}

export type MinAccessRole = "freeBusyReader" | "owner" | "reader" | "writer";

export interface CalendarListParams {
  /** Maximum number of entries returned in a page of results. Default is 100, max is 250. Optional. */
  maxResults?: number;
  /** Minimum access role for returned entries. Optional. Default is no restriction. */
  minAccessRole?: MinAccessRole;
  /** Token specifying which page of results to return. Optional. */
  pageToken?: string;
  /** Whether to include deleted calendar list entries in the result. Optional. Default is false. */
  showDeleted?: boolean;
  /** Whether to show hidden entries. Optional. Default is false. */
  showHidden?: boolean;
  /** Token for incremental synchronization. Optional. Default returns all entries. */
  syncToken?: string;
}

export interface CalendarList {
  kind: string;
  etag: string;
  nextPageToken: string;
  nextSyncToken: string;
  items: CalendarListResource[];
}

export interface CalendarListResource {
  kind: string;
  etag: string;
  id: string;
  summary: string;
  description?: string;
  location?: string;
  timeZone: string;
  summaryOverride?: string;
  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  hidden?: boolean;
  selected?: boolean;
  accessRole: string;
  defaultReminders?: {
    method: string;
    minutes: number;
  }[];
  notificationSettings?: {
    notifications: {
      type: string;
      method: string;
    }[];
  };
  primary?: boolean;
  deleted?: boolean;
  conferenceProperties?: {
    allowedConferenceSolutionTypes: string[];
  };
}

export interface Calendar {
  kind: string;
  etag: string;
  id: string;
  summary: string;
  description: string;
  location: string;
  timeZone: string;
  conferenceProperties: {
    allowedConferenceSolutionTypes: string[];
  };
}

export interface EventsListParams {
  /** Calendar identifier. */
  calendarId: string;
  /** Whether to include deleted events. Default is false. */
  showDeleted?: boolean;
  /** Maximum number of events returned. Default is 250, max is 2500. */
  maxResults?: number;
  /** Token specifying which page of results to return. */
  pageToken?: string;
  /** Lower bound for an event's start time to filter by. RFC3339 timestamp. */
  timeMin?: string;
  /** Upper bound for an event's start time to filter by. RFC3339 timestamp. */
  timeMax?: string;
  /** The order of the events returned. Default is 'startTime'. */
  orderBy?: "startTime" | "updated";
  /** Token for incremental synchronization. */
  syncToken?: string;
  /** Whether to expand recurring events into instances. Default is false. */
  singleEvents?: boolean;
  /** Time zone used in the response. Default is the calendar's time zone. */
  timeZone?: string;
}

export interface EventDateTime {
  /** The date, if this is an all-day event. */
  date?: string;
  /** The time, as a combined date-time value (RFC3339). */
  dateTime?: string;
  /** The time zone in which the time is specified. */
  timeZone?: string;
}

export interface EventAttendee {
  /** The attendee's email address. */
  email: string;
  /** The attendee's name. */
  displayName?: string;
  /** Whether this is an optional attendee. */
  optional?: boolean;
  /** The attendee's response status. */
  responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
  /** Whether this entry represents the calendar on which this copy of the event appears. */
  self?: boolean;
  /** Whether the attendee is the organizer of the event. */
  organizer?: boolean;
  /** The attendee's response comment. */
  comment?: string;
}

export interface EventReminder {
  /** The method used by this reminder. */
  method: "email" | "popup";
  /** Number of minutes before the start of the event when the reminder should trigger. */
  minutes: number;
}

export interface Event {
  /** Type of the resource. */
  kind: string;
  /** ETag of the resource. */
  etag: string;
  /** Opaque identifier of the event. */
  id: string;
  /** Status of the event. */
  status?: "confirmed" | "tentative" | "cancelled";
  /** HTML link to the event in Google Calendar Web UI. */
  htmlLink: string;
  /** Title of the event. */
  summary?: string;
  /** Description of the event. */
  description?: string;
  /** Geographic location of the event. */
  location?: string;
  /** Color ID of the event. */
  colorId?: string;
  /** Creator of the event. */
  creator?: {
    email: string;
    displayName?: string;
    self?: boolean;
  };
  /** Organizer of the event. */
  organizer?: {
    email: string;
    displayName?: string;
    self?: boolean;
  };
  /** The (inclusive) start time of the event. */
  start: EventDateTime;
  /** The (exclusive) end time of the event. */
  end: EventDateTime;
  /** Whether the end time is actually unspecified. */
  endTimeUnspecified?: boolean;
  /** List of RRULE, EXRULE, RDATE and EXDATE lines for a recurring event. */
  recurrence?: string[];
  /** For an instance of a recurring event, this is the id of the recurring event to which this instance belongs. */
  recurringEventId?: string;
  /** Whether the event blocks time on the calendar. */
  transparency?: "opaque" | "transparent";
  /** Visibility of the event. */
  visibility?: "default" | "public" | "private" | "confidential";
  /** Event unique identifier as defined in RFC5545. */
  iCalUID: string;
  /** Sequence number as per iCalendar. */
  sequence: number;
  /** The attendees of the event. */
  attendees?: EventAttendee[];
  /** Whether attendees may have been omitted from the event's representation. */
  attendeesOmitted?: boolean;
  /** Extended properties of the event. */
  extendedProperties?: {
    private?: Record<string, string>;
    shared?: Record<string, string>;
  };
  /** An absolute link to the Google Hangout associated with this event. */
  hangoutLink?: string;
  /** Conference data associated with this event. */
  conferenceData?: {
    createRequest?: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
    entryPoints?: Array<{
      entryPointType: string;
      uri: string;
      label?: string;
    }>;
    conferenceSolution?: {
      key: {
        type: string;
      };
      name: string;
      iconUri: string;
    };
    conferenceId?: string;
  };
  /** Whether anyone can invite themselves to the event. */
  guestsCanInviteOthers?: boolean;
  /** Whether attendees other than the organizer can modify the event. */
  guestsCanModify?: boolean;
  /** Whether attendees other than the organizer can see who the event's attendees are. */
  guestsCanSeeOtherGuests?: boolean;
  /** Whether this is a private event copy. */
  privateCopy?: boolean;
  /** Information about the event's reminders. */
  reminders?: {
    useDefault: boolean;
    overrides?: EventReminder[];
  };
  /** Source from which the event was created. */
  source?: {
    url: string;
    title: string;
  };
  /** List of attachments for the event. */
  attachments?: Array<{
    fileUrl: string;
    title: string;
    mimeType?: string;
    iconLink?: string;
    fileId?: string;
  }>;
  /** Creation time of the event (as a RFC3339 timestamp). */
  created: string;
  /** Last modification time of the event (as a RFC3339 timestamp). */
  updated: string;
}

export interface EventsList {
  /** Type of the collection. */
  kind: string;
  /** ETag of the collection. */
  etag: string;
  /** Title of the calendar. */
  summary: string;
  /** Description of the calendar. */
  description?: string;
  /** Last modification time of the calendar (as a RFC3339 timestamp). */
  updated: string;
  /** The time zone of the calendar. */
  timeZone: string;
  /** Opaque value used to access the next page. */
  nextPageToken?: string;
  /** Token used for incremental synchronization. */
  nextSyncToken?: string;
  /** List of events on the calendar. */
  items: Event[];
}

export interface CreateEventParams {
  /** Calendar identifier. */
  calendarId: string;
  /** Whether to send notifications about the creation of the new event. Default is false. */
  sendNotifications?: boolean;
  /** Deprecated. Please use sendNotifications instead. */
  sendUpdates?: "all" | "externalOnly" | "none";
  /** The maximum number of attendees to include in the response. */
  maxAttendees?: number;
  /** Whether to support v2 of calendar attachments. Default is false. */
  supportsAttachments?: boolean;
  /** Version of conference data supported by the API client. Default is 1. */
  conferenceDataVersion?: number;
}

export interface UpdateEventParams extends CreateEventParams {
  /** Event identifier. */
  eventId: string;
  /** Whether to always include a value in the email field for the organizer, creator and attendees. */
  alwaysIncludeEmail?: boolean;
}
