// ============================
// Figma API Types
// ============================

/**
 * @description Figma API response with success/error information
 */
export interface FigmaResponse<T = unknown> {
  err?: string;
  status?: number;
  data?: T;
}

/**
 * @description Figma document node
 */
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  [key: string]:
    | string
    | number
    | boolean
    | FigmaNode
    | FigmaComponent
    | FigmaComponentSet
    | FigmaStyle
    | undefined; // Other specific fields of the node
}

/**
 * @description Figma component
 */
export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  [key: string]: string | number | boolean | undefined; // Other specific fields of the component
}

/**
 * @description Figma component set
 */
export interface FigmaComponentSet {
  key: string;
  name: string;
  [key: string]: string | number | boolean | undefined; // Other specific fields of the component set
}

/**
 * @description Figma style
 */
export interface FigmaStyle {
  key: string;
  name: string;
  [key: string]: string | number | boolean | undefined; // Other specific fields of the style
}

/**
 * @description Figma file
 */
export interface FigmaFile {
  name: string;
  role: string;
  lastModified: string;
  editorType: string;
  thumbnailUrl: string;
  version: string;
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  componentSets: Record<string, FigmaComponentSet>;
  schemaVersion: number;
  styles: Record<string, FigmaStyle>;
  mainFileKey?: string;
  branches?: Array<{
    key: string;
    name: string;
    thumbnail_url: string;
    last_modified: string;
    link_access: string;
  }>;
}

/**
 * @description Figma file nodes response
 */
export interface FigmaFileNodesResponse {
  nodes: Record<string, {
    document: FigmaNode;
    components: Record<string, FigmaComponent>;
    componentSets: Record<string, FigmaComponentSet>;
    styles: Record<string, FigmaStyle>;
    schemaVersion: number;
  }>;
}

/**
 * @description Figma images response
 */
export interface FigmaImagesResponse {
  images: Record<string, string | null>;
}

/**
 * @description Figma image fills response
 */
export interface FigmaImageFillsResponse {
  images: Record<string, string>;
}

// ============================
// Figma Client Interface
// ============================

export interface FigmaClient {
  // Files
  "GET /v1/files/:fileKey": {
    response: FigmaFile;
    searchParams?: {
      version?: string;
      ids?: string;
      depth?: number;
      geometry?: "paths";
      plugin_data?: string;
      branch_data?: boolean;
    };
  };

  "GET /v1/files/:fileKey/nodes": {
    response: FigmaFileNodesResponse;
    searchParams: {
      ids: string;
      version?: string;
      depth?: number;
      geometry?: "paths";
      plugin_data?: string;
    };
  };

  // Images
  "GET /v1/images/:fileKey": {
    response: FigmaImagesResponse;
    searchParams: {
      ids: string;
      scale?: number;
      format?: "jpg" | "png" | "svg" | "pdf";
      svg_outline_text?: boolean;
      svg_include_id?: boolean;
      svg_include_node_id?: boolean;
      svg_simplify_stroke?: boolean;
      contents_only?: boolean;
      use_absolute_bounds?: boolean;
      version?: string;
    };
  };

  "GET /v1/files/:fileKey/images": {
    response: FigmaImageFillsResponse;
  };

  // User
  "GET /v1/me": {
    response: {
      id: string;
      email: string;
      handle: string;
      img_url: string;
    };
  };
}

// Auth client for OAuth token operations
export interface AuthClient {
  "POST /token": {
    body: {
      grant_type: string;
      code?: string;
      refresh_token?: string;
      client_id?: string;
      client_secret?: string;
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
