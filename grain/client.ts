const BASE_URL = "https://api.grain.com/_/public-api";

// Interfaces based on the README.md documentation

/**
 * @description Represents the response structure from the Grain API.
 * Assumes 'ok' isn't explicitly part of the payload, success is determined by HTTP status.
 * Errors might be handled differently (e.g., through HTTP status codes and error responses).
 */
interface GrainApiResponse<T = unknown> {
  data: T;
  // Grain API doesn't seem to wrap responses with 'ok'/'error' like Slack does.
  // Error handling will rely on HTTP status codes and potential error objects in the response body.
  error?: { message: string; [key: string]: unknown }; // Placeholder for potential error structure
}

/**
 * @description User information from /me endpoint
 */
export interface GrainMe {
  id: string;
  name: string;
}

/**
 * @description Basic recording information (from list)
 */
export interface GrainRecordingBasic {
  id: string;
  title: string;
  url: string;
  start_datetime: string; // ISO 8601 format
  end_datetime: string; // ISO 8601 format
  public_thumbnail_url: string | null;
}

/**
 * @description Participant in a recording
 */
export interface GrainParticipant {
  email: string;
  name: string;
  scope: "internal" | "external"; // Assuming scope types
}

/**
 * @description Highlight within a recording
 */
export interface GrainHighlight {
  id: string;
  recording_id: string;
  text: string;
  transcript: string;
  speakers?: string[]; // Optional based on webhook payload example
  timestamp: number; // milliseconds? README doesn't specify units
  duration: number; // milliseconds? README doesn't specify units
  created_datetime: string; // ISO 8601 format
  url: string;
  thumbnail_url: string;
  tags?: string[]; // Optional based on webhook payload example
}

/**
 * @description Detailed recording information (from get by ID)
 */
export interface GrainRecordingDetailed extends GrainRecordingBasic {
  participants?: GrainParticipant[]; // Optional based on include_participants
  owners?: string[]; // Optional based on include_owners
  tags?: string[];
  highlights?: GrainHighlight[]; // Optional based on include_highlights
  transcript_json?: unknown; // Structure not defined in README
  transcript_vtt?: string; // URL
  transcript_srt?: string; // URL (not explicitly mentioned for GET /:id, but exists as separate endpoint)
  intelligence_notes_json?: unknown; // Structure not defined
  intelligence_notes_md?: string;
  intelligence_notes_text?: string;
  calendar_event_uid?: string; // Optional based on include_calendar_id
}

/**
 * @description View (saved filter) information
 */
export interface GrainView {
  id: string;
  name: string;
}

/**
 * @description Webhook information
 */
export interface GrainHook {
  id: string;
  hook_url: string;
  view_id: string;
  inserted_at: string; // ISO 8601 format
  actions?: Array<"added" | "updated" | "removed">; // Not in GET response example, but part of POST
}

// Parameters for API methods

export interface GetRecordingsParams {
  cursor?: string;
  include_highlights?: boolean;
  include_participants?: boolean;
  include_calendar_id?: boolean;
  attendance?: "hosted" | "attended";
}

export interface GetRecordingByIdParams {
  include_highlights?: boolean;
  include_participants?: boolean; // Default true
  include_owners?: boolean; // Default true
  include_calendar_id?: boolean; // Default false
  transcript_format?: "json" | "vtt"; // Default null
  intelligence_notes_format?: "json" | "md" | "text"; // Default null
  allowed_intelligence_notes?: string[]; // Default []
}

export interface GetViewsParams {
  cursor?: string;
  type_filter?: "recordings" | "highlights" | "stories";
}

export interface CreateHookParams {
  version: 2; // Hardcoded
  hook_url: string;
  view_id: string;
  actions?: Array<"added" | "updated" | "removed">; // Default all
}

/**
 * @description Client for interacting with Grain APIs
 */
export class GrainClient {
  private headers: { Authorization: string; "Content-Type": string };
  private baseUrl: string;

  constructor(
    authToken: string, // Can be Personal Access Token or OAuth2 Access Token
    baseUrl: string = BASE_URL,
  ) {
    this.headers = {
      "Authorization": `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> { // Changed return type
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: { ...this.headers, ...options.headers },
    });

    if (!response.ok) {
      // Attempt to parse error details from the response body
      let errorDetails: unknown;
      try {
        errorDetails = await response.json();
      } catch (_e) {
        // If body isn't JSON or is empty
        errorDetails = { message: await response.text() };
      }

      console.error(
        `Grain API request failed: ${response.status} ${response.statusText}`,
        errorDetails,
      );
      // Throw a more structured error if possible
      // Construct a meaningful error message
      const errorBodyText =
        typeof errorDetails === "object" && errorDetails !== null &&
          "message" in errorDetails
          ? (errorDetails as { message: string }).message
          : JSON.stringify(errorDetails);
      throw new Error(
        `Grain API request failed: ${response.status} ${response.statusText}. URL: ${url}. Details: ${errorBodyText}`,
      );
    }

    // Handle cases where the response might be empty (e.g., DELETE success)
    if (
      response.status === 204 || response.headers.get("content-length") === "0"
    ) {
      // For DELETE, the API docs show { "success": true }, but a 204 No Content is also common.
      // We return a success indicator or an empty object as appropriate.
      // Returning the raw response might be better if the caller needs status/headers.
      // For simplicity here, we'll return a generic success object for non-GET/non-204 cases if needed,
      // or handle it based on the specific method's expectations.
      // If it's a known successful response type (like delete), return a simple success object.
      if (options.method === "DELETE" && response.status === 200) {
        // API docs say DELETE returns { "success": true } with 200 OK
        return await response.json() as T;
      }
      // If it's 204 No Content, or other methods with potentially empty success bodies
      return {} as T; // Or adjust based on specific endpoint needs
    }

    // Assuming successful responses are always JSON
    try {
      return await response.json() as T;
    } catch (e: unknown) {
      console.error("Failed to parse Grain API JSON response:", e);
      // Use type assertion for accessing message property
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error(
        `Failed to parse JSON response from ${url}: ${errorMessage}`,
      );
    }
  }

  /**
   * @description Get authenticated user's details
   */
  getMe(): Promise<GrainMe> {
    return this.fetch<GrainMe>("/me");
  }

  /**
   * @description Get a list of recordings
   */
  getRecordings(
    params: GetRecordingsParams = {},
  ): Promise<{ recordings: GrainRecordingBasic[]; cursor: string | null }> {
    const searchParams = new URLSearchParams();
    if (params.cursor) searchParams.set("cursor", params.cursor);
    if (params.include_highlights) {
      searchParams.set("include_highlights", "true");
    }
    if (params.include_participants) {
      searchParams.set("include_participants", "true");
    }
    if (params.include_calendar_id) {
      searchParams.set("include_calendar_id", "true");
    }
    if (params.attendance) searchParams.set("attendance", params.attendance);

    const endpoint = `/recordings?${searchParams.toString()}`;
    return this.fetch<
      { recordings: GrainRecordingBasic[]; cursor: string | null }
    >(
      endpoint,
    );
  }

  /**
   * @description Get details for a specific recording
   */
  getRecordingById(
    id: string,
    params: GetRecordingByIdParams = {},
  ): Promise<GrainRecordingDetailed> {
    const searchParams = new URLSearchParams();
    if (params.include_highlights) {
      searchParams.set("include_highlights", "true");
    }
    if (params.include_participants !== undefined) { // Default is true, so only set if explicitly false
      searchParams.set(
        "include_participants",
        String(params.include_participants),
      );
    }
    if (params.include_owners !== undefined) { // Default is true, so only set if explicitly false
      searchParams.set("include_owners", String(params.include_owners));
    }
    if (params.include_calendar_id) {
      searchParams.set("include_calendar_id", "true");
    }
    if (params.transcript_format) {
      searchParams.set("transcript_format", params.transcript_format);
    }
    if (params.intelligence_notes_format) {
      searchParams.set(
        "intelligence_notes_format",
        params.intelligence_notes_format,
      );
      if (
        params.allowed_intelligence_notes &&
        params.allowed_intelligence_notes.length > 0
      ) {
        // Assuming it takes a comma-separated list if it's an array, check API docs if needed
        searchParams.set(
          "allowed_intelligence_notes",
          params.allowed_intelligence_notes.join(","),
        );
      }
    }

    const endpoint = `/recordings/${id}?${searchParams.toString()}`;
    return this.fetch<GrainRecordingDetailed>(endpoint);
  }

  /**
   * @description Get recording transcript in VTT format (Requires paid seat)
   * @returns The VTT transcript as a string.
   */
  async getRecordingTranscriptVtt(id: string): Promise<string> {
    const endpoint = `/recordings/${id}/transcript.vtt`;
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch VTT transcript: ${response.status} ${response.statusText}. URL: ${url}`,
      );
    }
    // VTT is plain text
    return response.text();
  }

  /**
   * @description Get recording transcript in SRT format (Requires paid seat)
   * @returns The SRT transcript as a string.
   */
  async getRecordingTranscriptSrt(id: string): Promise<string> {
    const endpoint = `/recordings/${id}/transcript.srt`;
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch SRT transcript: ${response.status} ${response.statusText}. URL: ${url}`,
      );
    }
    // SRT is plain text
    return response.text();
  }

  /**
   * @description List views (saved filters)
   */
  getViews(
    params: GetViewsParams = {},
  ): Promise<{ views: GrainView[]; cursor: string | null }> {
    const searchParams = new URLSearchParams();
    if (params.cursor) searchParams.set("cursor", params.cursor);
    if (params.type_filter) searchParams.set("type_filter", params.type_filter);

    const endpoint = `/views?${searchParams.toString()}`;
    return this.fetch<{ views: GrainView[]; cursor: string | null }>(endpoint);
  }

  /**
   * @description Create a REST Hook
   */
  createHook(params: CreateHookParams): Promise<GrainHook> {
    // Ensure version is set correctly
    const body = { ...params, version: 2 };
    return this.fetch<GrainHook>("/hooks", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * @description List existing webhooks
   */
  getHooks(): Promise<{ hooks: GrainHook[] }> {
    return this.fetch<{ hooks: GrainHook[] }>("/hooks");
  }

  /**
   * @description Delete a webhook by ID
   */
  deleteHook(id: string): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>(`/hooks/${id}`, {
      method: "DELETE",
    });
  }
}
