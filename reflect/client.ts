const BASE_URL = "https://reflect.app/api";

// Interfaces based on the OpenAPI spec

/**
 * @description Represents the response structure from the Reflect API.
 */
interface ReflectApiResponse<T = unknown> {
  data: T;
  error?: { message: string; [key: string]: unknown };
}

/**
 * @description Graph information
 */
export interface Graph {
  id: string;
  name: string;
}

/**
 * @description Book information
 */
export interface Book {
  id: string;
  asin: string;
  title: string;
  authors?: string[];
  notes?: BookNote[];
}

/**
 * @description Book note
 */
export interface BookNote {
  type: "note" | "highlight";
  page?: number;
  location?: number;
  value?: string;
}

/**
 * @description Link information
 */
export interface Link {
  id?: string;
  url: string;
  title?: string;
  description?: string;
  updated_at?: string;
  highlights?: string[];
}

/**
 * @description User information
 */
export interface User {
  uid: string;
  email?: string;
  name?: string;
  graph_ids?: string[];
}

/**
 * @description Daily note append parameters
 */
export interface DailyNoteAppendParams {
  date?: string;
  text: string;
  transform_type: "list-append";
  list_name?: string;
}

/**
 * @description Note creation parameters
 */
export interface CreateNoteParams {
  subject: string;
  content_markdown: string;
  pinned?: boolean;
}

/**
 * @description Client for interacting with Reflect API
 */
export class ReflectClient {
  private headers: { Authorization: string; "Content-Type": string };
  private baseUrl: string;

  constructor(
    authToken: string,
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
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: { ...this.headers, ...options.headers },
    });

    if (!response.ok) {
      let errorDetails: unknown;
      try {
        errorDetails = await response.json();
      } catch (_e) {
        errorDetails = { message: await response.text() };
      }

      console.error(
        `Reflect API request failed: ${response.status} ${response.statusText}`,
        errorDetails,
      );

      const errorBodyText =
        typeof errorDetails === "object" && errorDetails !== null &&
          "message" in errorDetails
          ? (errorDetails as { message: string }).message
          : JSON.stringify(errorDetails);

      throw new Error(
        `Reflect API request failed: ${response.status} ${response.statusText}. URL: ${url}. Details: ${errorBodyText}`,
      );
    }

    // Handle empty responses
    if (
      response.status === 204 || response.headers.get("content-length") === "0"
    ) {
      return {} as T;
    }

    // Parse JSON response
    try {
      return await response.json() as T;
    } catch (e: unknown) {
      console.error("Failed to parse Reflect API JSON response:", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error(
        `Failed to parse JSON response from ${url}: ${errorMessage}`,
      );
    }
  }

  /**
   * @description Get current user details
   */
  getMe(): Promise<User> {
    return this.fetch<User>("/users/me");
  }

  /**
   * @description Get graphs
   */
  getGraphs(): Promise<Graph[]> {
    return this.fetch<Graph[]>("/graphs");
  }

  /**
   * @description Get books from a graph
   */
  getBooks(graphId: string): Promise<Book[]> {
    return this.fetch<Book[]>(`/graphs/${graphId}/books`);
  }

  /**
   * @description Get links from a graph
   */
  getLinks(graphId: string): Promise<Link[]> {
    return this.fetch<Link[]>(`/graphs/${graphId}/links`);
  }

  /**
   * @description Create a new link
   */
  createLink(graphId: string, link: Link): Promise<Link> {
    return this.fetch<Link>(`/graphs/${graphId}/links`, {
      method: "POST",
      body: JSON.stringify(link),
    });
  }

  /**
   * @description Append to a daily note
   */
  appendToDailyNote(
    graphId: string,
    params: DailyNoteAppendParams,
  ): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>(`/graphs/${graphId}/daily-notes`, {
      method: "PUT",
      body: JSON.stringify(params),
    });
  }

  /**
   * @description Create a new note
   */
  createNote(
    graphId: string,
    params: CreateNoteParams,
  ): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>(`/graphs/${graphId}/notes`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  }
}
