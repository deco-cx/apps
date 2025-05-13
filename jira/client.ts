// Types for Jira API responses
export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      id: string;
      name: string;
    };
    assignee?: {
      accountId: string;
      displayName: string;
      emailAddress: string;
    };
    created: string;
    updated: string;
    priority?: {
      id: string;
      name: string;
    };
  };
}

export interface JiraSearchResponse {
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
}

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
}

export interface JiraResponse<T = unknown> {
  ok: boolean;
  error?: string;
  data: T;
}

export class JiraClient {
  private config: JiraConfig;
  private headers: Headers;

  constructor(config: JiraConfig) {
    this.config = config;
    this.headers = new Headers({
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Basic ${btoa(`${config.email}:${config.apiToken}`)}`,
    });
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<JiraResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: this.headers,
    });
    if (!response.ok) {
      const error = await response.text();
      return {
        ok: false,
        error: `Jira API Error: ${response.status} ${error}`,
        data: undefined as unknown as T,
      };
    }

    if (response.status === 204) {
      return { ok: true, data: {} as T };
    }

    const data = await response.json();
    return { ok: true, data };
  }

  /**
   * @description Run a JQL query to search for Jira issues
   */
  runJql(
    jql: string,
    startAt = 0,
    maxResults = 50,
  ): Promise<JiraResponse<JiraSearchResponse>> {
    const endpoint = "/rest/api/3/search";
    const body = {
      jql,
      startAt,
      maxResults,
      fields: [
        "summary",
        "description",
        "status",
        "assignee",
        "created",
        "updated",
        "priority",
      ],
    };
    return this.fetch<JiraSearchResponse>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  getIssue(issueKey: string): Promise<JiraResponse<JiraIssue>> {
    const endpoint = `/rest/api/3/issue/${issueKey}`;
    return this.fetch<JiraIssue>(endpoint);
  }

  addComment(
    issueKey: string,
    comment: string,
  ): Promise<JiraResponse<unknown>> {
    const endpoint = `/rest/api/3/issue/${issueKey}/comment`;
    const body = {
      body: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: comment,
              },
            ],
          },
        ],
      },
    };
    return this.fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updateField(
    issueKey: string,
    field: string,
    value: unknown,
  ): Promise<JiraResponse<unknown>> {
    const endpoint = `/rest/api/3/issue/${issueKey}`;
    const body = {
      fields: {
        [field]: { value },
      },
    };
    return await this.fetch(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }
}
