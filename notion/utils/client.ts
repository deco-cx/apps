import {
  NotionBlock,
  NotionComment,
  NotionDatabase,
  NotionPage,
  NotionSearchResult,
  NotionUser,
  RichText,
} from "./types.ts";

export interface NotionClient {
  // Pages
  "POST /pages": {
    response: NotionPage;
    body: {
      parent: {
        database_id?: string;
        page_id?: string;
        type?: "database_id" | "page_id";
      };
      properties: Record<string, unknown>;
      children?: NotionBlock[];
      icon?: {
        type: "emoji" | "external" | "file";
        emoji?: string;
        external?: { url: string };
        file?: { url: string };
      };
      cover?: {
        type: "external" | "file";
        external?: { url: string };
        file?: { url: string };
      };
    };
  };
  "GET /pages/:page_id": {
    response: NotionPage;
  };
  "PATCH /pages/:page_id": {
    response: NotionPage;
    body: {
      properties?: Record<string, unknown>;
      archived?: boolean;
      icon?: {
        type: "emoji" | "external" | "file";
        emoji?: string;
        external?: { url: string };
        file?: { url: string };
      };
      cover?: {
        type: "external" | "file";
        external?: { url: string };
        file?: { url: string };
      };
    };
  };

  // Databases
  "POST /databases": {
    response: NotionDatabase;
    body: {
      parent: {
        type: "page_id";
        page_id: string;
      };
      title: RichText[];
      properties: Record<string, unknown>;
      icon?: {
        type: "emoji" | "external" | "file";
        emoji?: string;
        external?: { url: string };
        file?: { url: string };
      };
      cover?: {
        type: "external" | "file";
        external?: { url: string };
        file?: { url: string };
      };
      description?: RichText[];
      is_inline?: boolean;
    };
  };
  "GET /databases/:database_id": {
    response: NotionDatabase;
  };
  "PATCH /databases/:database_id": {
    response: NotionDatabase;
    body: {
      title?: RichText[];
      description?: RichText[];
      properties?: Record<string, unknown>;
      icon?: {
        type: "emoji" | "external" | "file";
        emoji?: string;
        external?: { url: string };
        file?: { url: string };
      };
      cover?: {
        type: "external" | "file";
        external?: { url: string };
        file?: { url: string };
      };
      archived?: boolean;
    };
  };
  "POST /databases/:database_id/query": {
    response: {
      object: "list";
      results: NotionPage[];
      next_cursor?: string;
      has_more: boolean;
      type: "page";
      page: Record<PropertyKey, never>;
    };
    body: {
      filter?: unknown;
      sorts?: unknown[];
      start_cursor?: string;
      page_size?: number;
    };
  };

  // Blocks
  "GET /blocks/:block_id": {
    response: NotionBlock;
  };
  "PATCH /blocks/:block_id": {
    response: NotionBlock;
    body: Record<string, unknown>;
  };
  "DELETE /blocks/:block_id": {
    response: NotionBlock;
  };
  "GET /blocks/:block_id/children": {
    response: {
      object: "list";
      results: NotionBlock[];
      next_cursor?: string;
      has_more: boolean;
      type: "block";
      block: Record<PropertyKey, never>;
    };
  };
  "PATCH /blocks/:block_id/children": {
    response: {
      object: "list";
      results: NotionBlock[];
      next_cursor?: string;
      has_more: boolean;
      type: "block";
      block: Record<PropertyKey, never>;
    };
    body: {
      children: NotionBlock[];
      after?: string;
    };
  };

  // Users
  "GET /users": {
    response: {
      object: "list";
      results: NotionUser[];
      next_cursor?: string;
      has_more: boolean;
      type: "user";
      user: Record<PropertyKey, never>;
    };
  };
  "GET /users/:user_id": {
    response: NotionUser;
  };
  "GET /users/me": {
    response: NotionUser;
  };

  // Comments
  "POST /comments": {
    response: NotionComment;
    body: {
      parent: {
        page_id?: string;
        block_id?: string;
      };
      rich_text: RichText[];
    };
  };
  "GET /comments": {
    response: {
      object: "list";
      results: NotionComment[];
      next_cursor?: string;
      has_more: boolean;
      type: "comment";
      comment: Record<PropertyKey, never>;
    };
  };

  // Search
  "POST /search": {
    response: NotionSearchResult;
    body: {
      query?: string;
      sort?: {
        direction: "ascending" | "descending";
        timestamp: "last_edited_time";
      };
      filter?: {
        value: "page" | "database";
        property: "object";
      };
      start_cursor?: string;
      page_size?: number;
    };
  };
}
