// Notion API Types based on https://developers.notion.com/reference/intro

export interface NotionUser {
  object: "user";
  id: string;
  type: "person" | "bot";
  name?: string;
  avatar_url?: string;
  person?: {
    email?: string;
  };
  bot?: {
    owner: {
      type: "workspace" | "user";
      workspace?: boolean;
    };
    workspace_name?: string;
  };
}

export interface NotionPage {
  object: "page";
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: NotionUser;
  last_edited_by: NotionUser;
  cover?: {
    type: "external" | "file";
    external?: { url: string };
    file?: { url: string; expiry_time: string };
  };
  icon?: {
    type: "emoji" | "external" | "file";
    emoji?: string;
    external?: { url: string };
    file?: { url: string; expiry_time: string };
  };
  parent: {
    type: "database_id" | "page_id" | "workspace";
    database_id?: string;
    page_id?: string;
    workspace?: boolean;
  };
  archived: boolean;
  in_trash: boolean;
  properties: Record<string, unknown>;
  url: string;
  public_url?: string;
}

export interface NotionDatabase {
  object: "database";
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: NotionUser;
  last_edited_by: NotionUser;
  title: RichText[];
  description: RichText[];
  icon?: {
    type: "emoji" | "external" | "file";
    emoji?: string;
    external?: { url: string };
    file?: { url: string; expiry_time: string };
  };
  cover?: {
    type: "external" | "file";
    external?: { url: string };
    file?: { url: string; expiry_time: string };
  };
  properties: Record<string, DatabaseProperty>;
  parent: {
    type: "page_id" | "workspace";
    page_id?: string;
    workspace?: boolean;
  };
  url: string;
  archived: boolean;
  in_trash: boolean;
  is_inline: boolean;
  public_url?: string;
}

export interface NotionBlock {
  object: "block";
  id: string;
  parent: {
    type: "database_id" | "page_id" | "block_id";
    database_id?: string;
    page_id?: string;
    block_id?: string;
  };
  created_time: string;
  last_edited_time: string;
  created_by: NotionUser;
  last_edited_by: NotionUser;
  has_children: boolean;
  archived: boolean;
  in_trash: boolean;
  type: string;
  [key: string]: unknown; // Block-specific properties
}

export interface RichText {
  type: "text" | "mention" | "equation";
  text?: {
    content: string;
    link?: { url: string };
  };
  mention?: {
    type:
      | "user"
      | "page"
      | "database"
      | "date"
      | "link_preview"
      | "template_mention";
    user?: NotionUser;
    page?: { id: string };
    database?: { id: string };
    date?: {
      start: string;
      end?: string;
      time_zone?: string;
    };
  };
  equation?: {
    expression: string;
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href?: string;
}

export interface DatabaseProperty {
  id: string;
  name: string;
  type:
    | "title"
    | "rich_text"
    | "number"
    | "select"
    | "multi_select"
    | "date"
    | "people"
    | "files"
    | "checkbox"
    | "url"
    | "email"
    | "phone_number"
    | "formula"
    | "relation"
    | "rollup"
    | "created_time"
    | "created_by"
    | "last_edited_time"
    | "last_edited_by"
    | "status"
    | "unique_id"
    | "verification";
  [key: string]: unknown; // Property-specific configuration
}

export interface NotionComment {
  object: "comment";
  id: string;
  parent: {
    type: "page_id" | "block_id";
    page_id?: string;
    block_id?: string;
  };
  discussion_id: string;
  created_time: string;
  last_edited_time: string;
  created_by: NotionUser;
  rich_text: RichText[];
}

export interface NotionSearchResult {
  object: "list";
  results: (NotionPage | NotionDatabase)[];
  next_cursor?: string;
  has_more: boolean;
  type: "page_or_database";
  page_or_database: Record<PropertyKey, never>;
}

export interface NotionError {
  object: "error";
  status: number;
  code: string;
  message: string;
}
