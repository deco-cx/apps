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
 * @description Client to interact with Figma APIs
 */
export class FigmaClient {
  private headers: { "X-FIGMA-TOKEN": string };

  constructor(accessToken: string) {
    this.headers = {
      "X-FIGMA-TOKEN": accessToken,
    };
  }

  /**
   * @description Gets a file JSON from Figma
   * @param fileKey File key
   * @param options Request options
   */
  async getFile(
    fileKey: string,
    options?: {
      version?: string;
      ids?: string[];
      depth?: number;
      geometry?: "paths";
      plugin_data?: string;
      branch_data?: boolean;
    },
  ): Promise<FigmaResponse<FigmaFile>> {
    const params = new URLSearchParams();

    if (options?.version) params.append("version", options.version);
    if (options?.ids) params.append("ids", options.ids.join(","));
    if (options?.depth) params.append("depth", options.depth.toString());
    if (options?.geometry) params.append("geometry", options.geometry);
    if (options?.plugin_data) params.append("plugin_data", options.plugin_data);
    if (options?.branch_data) {
      params.append("branch_data", options.branch_data.toString());
    }

    const response = await fetch(
      `https://api.figma.com/v1/files/${fileKey}${
        params.toString() ? `?${params}` : ""
      }`,
      { headers: this.headers },
    );

    return response.json();
  }

  /**
   * @description Get JSON from specific nodes in a file
   * @param fileKey File key
   * @param nodeIds Node IDs
   * @param options Request options
   */
  async getFileNodes(
    fileKey: string,
    nodeIds: string[],
    options?: {
      version?: string;
      depth?: number;
      geometry?: "paths";
      plugin_data?: string;
    },
  ): Promise<
    FigmaResponse<{
      nodes: Record<string, {
        document: FigmaNode;
        components: Record<string, FigmaComponent>;
        componentSets: Record<string, FigmaComponentSet>;
        styles: Record<string, FigmaStyle>;
        schemaVersion: number;
      }>;
    }>
  > {
    const params = new URLSearchParams({
      ids: nodeIds.join(","),
    });

    if (options?.version) params.append("version", options.version);
    if (options?.depth) params.append("depth", options.depth.toString());
    if (options?.geometry) params.append("geometry", options.geometry);
    if (options?.plugin_data) params.append("plugin_data", options.plugin_data);

    const response = await fetch(
      `https://api.figma.com/v1/files/${fileKey}/nodes?${params}`,
      { headers: this.headers },
    );

    return response.json();
  }

  /**
   * @description Renders images from a file
   * @param fileKey File key
   * @param nodeIds Node IDs
   * @param options Rendering options
   */
  async getImages(
    fileKey: string,
    nodeIds: string[],
    options?: {
      scale?: number;
      format?: "jpg" | "png" | "svg" | "pdf";
      svg_outline_text?: boolean;
      svg_include_id?: boolean;
      svg_include_node_id?: boolean;
      svg_simplify_stroke?: boolean;
      contents_only?: boolean;
      use_absolute_bounds?: boolean;
      version?: string;
    },
  ): Promise<
    FigmaResponse<{
      images: Record<string, string | null>;
    }>
  > {
    const params = new URLSearchParams({
      ids: nodeIds.join(","),
    });

    if (options?.scale) params.append("scale", options.scale.toString());
    if (options?.format) params.append("format", options.format);
    if (options?.svg_outline_text !== undefined) {
      params.append("svg_outline_text", options.svg_outline_text.toString());
    }
    if (options?.svg_include_id !== undefined) {
      params.append("svg_include_id", options.svg_include_id.toString());
    }
    if (options?.svg_include_node_id !== undefined) {
      params.append(
        "svg_include_node_id",
        options.svg_include_node_id.toString(),
      );
    }
    if (options?.svg_simplify_stroke !== undefined) {
      params.append(
        "svg_simplify_stroke",
        options.svg_simplify_stroke.toString(),
      );
    }
    if (options?.contents_only !== undefined) {
      params.append("contents_only", options.contents_only.toString());
    }
    if (options?.use_absolute_bounds !== undefined) {
      params.append(
        "use_absolute_bounds",
        options.use_absolute_bounds.toString(),
      );
    }
    if (options?.version) {
      params.append("version", options.version);
    }

    const response = await fetch(
      `https://api.figma.com/v1/images/${fileKey}?${params}`,
      { headers: this.headers },
    );

    return response.json();
  }

  /**
   * @description Renders images from a file. if no error occurs, `"images"` will be populated with a map from node ids to urls of the rendered images, and `"status"` will be omitted. the image assets will expire after 30 days. images up to 32 megapixels can be exported. any images that are larger will be scaled down. important: the image map may contain values that are `null`. this indicates that rendering of that specific node has failed. this may be due to the node id not existing, or other reasons such has the node having no renderable components. it is guaranteed that any node that was requested for rendering will be represented in this map whether or not the render succeeded. to render multiple images from the same file, use the `ids` query parameter to specify multiple node ids.
   * @param fileKey File key
   * @param nodeIds One or more node IDs (comma-separated string or array)
   */
  async getImageFromNode(
    fileKey: string,
    nodeIds: string[],
  ): Promise<
    FigmaResponse<{
      images: Record<string, string>;
    }>
  > {
    const ids = Array.isArray(nodeIds) ? nodeIds.join(",") : nodeIds;

    const response = await fetch(
      `https://api.figma.com/v1/images/${fileKey}?ids=${
        encodeURIComponent(ids)
      }`,
      {
        headers: this.headers,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Figma API error: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  /**
   * @description Gets download URLs for all images present in image fills
   * @param fileKey File key
   */
  async getImageFills(
    fileKey: string,
  ): Promise<{
    meta: {
      images: Record<string, string>;
    };
  }> {
    const response = await fetch(
      `https://api.figma.com/v1/files/${fileKey}/images`,
      { headers: this.headers },
    );

    return response.json();
  }
}
