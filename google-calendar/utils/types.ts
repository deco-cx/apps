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
