// deno-lint-ignore-file no-explicit-any require-await
import type { AppContext } from "../mod.ts";
import type { HubSpotError } from "./types.ts";

export class HubSpotAPIError extends Error {
  constructor(
    public status: number,
    public hubspotError: HubSpotError,
    public correlationId?: string,
  ) {
    super(hubspotError.message);
    this.name = "HubSpotAPIError";
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  searchParams?: Record<string, string | number | boolean | undefined>;
}

export class HubSpotClient {
  constructor(private ctx: AppContext) {}

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { method = "GET", body, headers = {}, searchParams } = options;
    const { api } = this.ctx;

    // Build URL with search parameters
    const url = new URL(endpoint, api.baseUrl);
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      });
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        ...api.headers,
        ...headers,
      },
    };

    if (body && method !== "GET") {
      if (headers["Content-Type"] === "application/x-www-form-urlencoded") {
        requestOptions.body = body;
      } else {
        requestOptions.body = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(url.toString(), requestOptions);

      if (!response.ok) {
        let errorBody: HubSpotError;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = {
            status: "error",
            message: `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        throw new HubSpotAPIError(
          response.status,
          errorBody,
          response.headers.get("X-HubSpot-Correlation-Id") || undefined,
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return await response.text() as unknown as T;
    } catch (error) {
      if (error instanceof HubSpotAPIError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Network error: ${message}`);
    }
  }

  // CRM API Methods
  async get<T>(
    endpoint: string,
    searchParams?: Record<string, any>,
  ): Promise<T> {
    return this.request<T>(endpoint, { searchParams });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body, headers });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // OAuth specific method for form-encoded requests
  async postFormEncoded<T>(
    endpoint: string,
    body: Record<string, string>,
  ): Promise<T> {
    const formBody = new URLSearchParams(body).toString();
    return this.request<T>(endpoint, {
      method: "POST",
      body: formBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  // Convenience methods for common CRM operations

  // Get object by ID
  async getObject(objectType: string, objectId: string, options?: {
    properties?: string[];
    propertiesWithHistory?: string[];
    associations?: string[];
    archived?: boolean;
  }): Promise<any> {
    const searchParams: Record<string, any> = {};

    if (options?.properties) {
      searchParams.properties = options.properties.join(",");
    }
    if (options?.propertiesWithHistory) {
      searchParams.propertiesWithHistory = options.propertiesWithHistory.join(
        ",",
      );
    }
    if (options?.associations) {
      searchParams.associations = options.associations.join(",");
    }
    if (options?.archived !== undefined) {
      searchParams.archived = options.archived;
    }

    return this.get(`/crm/v3/objects/${objectType}/${objectId}`, searchParams);
  }

  // List objects with pagination
  async listObjects(objectType: string, options?: {
    limit?: number;
    after?: string;
    properties?: string[];
    propertiesWithHistory?: string[];
    associations?: string[];
    archived?: boolean;
  }): Promise<any> {
    const searchParams: Record<string, any> = {};

    if (options?.limit) searchParams.limit = options.limit;
    if (options?.after) searchParams.after = options.after;
    if (options?.properties) {
      searchParams.properties = options.properties.join(",");
    }
    if (options?.propertiesWithHistory) {
      searchParams.propertiesWithHistory = options.propertiesWithHistory.join(
        ",",
      );
    }
    if (options?.associations) {
      searchParams.associations = options.associations.join(",");
    }
    if (options?.archived !== undefined) {
      searchParams.archived = options.archived;
    }

    return this.get(`/crm/v3/objects/${objectType}`, searchParams);
  }

  // Create object
  async createObject(objectType: string, data: any): Promise<any> {
    return this.post(`/crm/v3/objects/${objectType}`, data);
  }

  // Update object
  async updateObject(
    objectType: string,
    objectId: string,
    data: any,
  ): Promise<any> {
    return this.patch(`/crm/v3/objects/${objectType}/${objectId}`, data);
  }

  // Delete object
  async deleteObject(objectType: string, objectId: string): Promise<void> {
    return this.delete(`/crm/v3/objects/${objectType}/${objectId}`);
  }

  // Search objects
  async searchObjects(objectType: string, searchRequest: any): Promise<any> {
    return this.post(`/crm/v3/objects/${objectType}/search`, searchRequest);
  }

  // Batch operations
  async batchReadObjects(objectType: string, batchRequest: any): Promise<any> {
    return this.post(`/crm/v3/objects/${objectType}/batch/read`, batchRequest);
  }

  async batchCreateObjects(
    objectType: string,
    batchRequest: any,
  ): Promise<any> {
    return this.post(
      `/crm/v3/objects/${objectType}/batch/create`,
      batchRequest,
    );
  }

  async batchUpdateObjects(
    objectType: string,
    batchRequest: any,
  ): Promise<any> {
    return this.post(
      `/crm/v3/objects/${objectType}/batch/update`,
      batchRequest,
    );
  }

  async batchArchiveObjects(
    objectType: string,
    batchRequest: any,
  ): Promise<any> {
    return this.post(
      `/crm/v3/objects/${objectType}/batch/archive`,
      batchRequest,
    );
  }

  // Communications API Methods

  // Create a communication (WhatsApp, LinkedIn, or SMS message)
  async createCommunication(data: {
    properties: {
      hs_communication_channel_type: "WHATS_APP" | "LINKEDIN_MESSAGE" | "SMS";
      hs_communication_logged_from: "CRM";
      hs_communication_body: string;
      hubspot_owner_id?: number;
      hs_timestamp?: string | number;
    };
    associations?: Array<{
      to: { id: string | number };
      types: Array<{
        associationCategory: string;
        associationTypeId: number;
      }>;
    }>;
  }): Promise<any> {
    return this.post("/crm/v3/objects/communications", data);
  }

  // Get a communication by ID
  async getCommunication(
    communicationId: string,
    options?: {
      properties?: string[];
      associations?: string[];
    },
  ): Promise<any> {
    const searchParams: Record<string, any> = {};

    if (options?.properties) {
      searchParams.properties = options.properties.join(",");
    }
    if (options?.associations) {
      searchParams.associations = options.associations.join(",");
    }

    return this.get(
      `/crm/v3/objects/communications/${communicationId}`,
      searchParams,
    );
  }

  // List communications with pagination
  async listCommunications(options?: {
    limit?: number;
    after?: string;
    properties?: string[];
    associations?: string[];
    archived?: boolean;
  }): Promise<any> {
    const searchParams: Record<string, any> = {};

    if (options?.limit) searchParams.limit = options.limit;
    if (options?.after) searchParams.after = options.after;
    if (options?.properties) {
      searchParams.properties = options.properties.join(",");
    }
    if (options?.associations) {
      searchParams.associations = options.associations.join(",");
    }
    if (options?.archived !== undefined) {
      searchParams.archived = options.archived;
    }

    return this.get("/crm/v3/objects/communications", searchParams);
  }

  // Update a communication
  async updateCommunication(
    communicationId: string,
    data: {
      properties: {
        hs_communication_body?: string;
        hubspot_owner_id?: number;
        hs_timestamp?: string | number;
        [key: string]: any;
      };
    },
  ): Promise<any> {
    return this.patch(
      `/crm/v3/objects/communications/${communicationId}`,
      data,
    );
  }

  // Delete a communication
  async deleteCommunication(communicationId: string): Promise<void> {
    return this.delete(`/crm/v3/objects/communications/${communicationId}`);
  }

  // Associate a communication with a record
  async associateCommunication(
    communicationId: string,
    toObjectType: string,
    toObjectId: string | number,
    associationTypeId: string | number,
  ): Promise<any> {
    return this.put(
      `/crm/v3/objects/communications/${communicationId}/associations/${toObjectType}/${toObjectId}/${associationTypeId}`,
      {},
    );
  }

  // Remove association between communication and record
  async removeCommunicationAssociation(
    communicationId: string,
    toObjectType: string,
    toObjectId: string | number,
    associationTypeId: string | number,
  ): Promise<void> {
    return this.delete(
      `/crm/v3/objects/communications/${communicationId}/associations/${toObjectType}/${toObjectId}/${associationTypeId}`,
    );
  }

  // Batch operations for communications
  async batchReadCommunications(batchRequest: any): Promise<any> {
    return this.post("/crm/v3/objects/communications/batch/read", batchRequest);
  }

  async batchCreateCommunications(batchRequest: any): Promise<any> {
    return this.post(
      "/crm/v3/objects/communications/batch/create",
      batchRequest,
    );
  }

  async batchUpdateCommunications(batchRequest: any): Promise<any> {
    return this.post(
      "/crm/v3/objects/communications/batch/update",
      batchRequest,
    );
  }

  async batchArchiveCommunications(batchRequest: any): Promise<any> {
    return this.post(
      "/crm/v3/objects/communications/batch/archive",
      batchRequest,
    );
  }

  // Search communications
  async searchCommunications(searchRequest: any): Promise<any> {
    return this.post("/crm/v3/objects/communications/search", searchRequest);
  }
}
