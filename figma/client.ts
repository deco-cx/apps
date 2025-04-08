/**
 * @description Resposta da API do Figma com informações de sucesso/erro
 */
export interface FigmaResponse<T = unknown> {
  err?: string;
  status?: number;
  data?: T;
}

/**
 * @description Nó do documento Figma
 */
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  [key: string]: any; // Outros campos específicos do nó
}

/**
 * @description Componente do Figma
 */
export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  [key: string]: any;
}

/**
 * @description Conjunto de componentes do Figma
 */
export interface FigmaComponentSet {
  key: string;
  name: string;
  [key: string]: any;
}

/**
 * @description Estilo do Figma
 */
export interface FigmaStyle {
  key: string;
  name: string;
  [key: string]: any;
}

/**
 * @description Arquivo do Figma
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
 * @description Cliente para interagir com as APIs do Figma
 */
export class FigmaClient {
  private headers: { "X-FIGMA-TOKEN": string };

  constructor(accessToken: string) {
    this.headers = {
      "X-FIGMA-TOKEN": accessToken,
    };
  }

  /**
   * @description Obtém um arquivo do Figma
   * @param fileKey Chave do arquivo
   * @param options Opções da requisição
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
    }
  ): Promise<FigmaResponse<FigmaFile>> {
    const params = new URLSearchParams();

    if (options?.version) params.append("version", options.version);
    if (options?.ids) params.append("ids", options.ids.join(","));
    if (options?.depth) params.append("depth", options.depth.toString());
    if (options?.geometry) params.append("geometry", options.geometry);
    if (options?.plugin_data) params.append("plugin_data", options.plugin_data);
    if (options?.branch_data) params.append("branch_data", options.branch_data.toString());

    const response = await fetch(
      `https://api.figma.com/v1/files/${fileKey}${params.toString() ? `?${params}` : ""}`,
      { headers: this.headers }
    );

    return response.json();
  }

  /**
   * @description Obtém nós específicos de um arquivo
   * @param fileKey Chave do arquivo
   * @param nodeIds IDs dos nós
   * @param options Opções da requisição
   */
  async getFileNodes(
    fileKey: string,
    nodeIds: string[],
    options?: {
      version?: string;
      depth?: number;
      geometry?: "paths";
      plugin_data?: string;
    }
  ): Promise<FigmaResponse<{
    nodes: Record<string, {
      document: FigmaNode;
      components: Record<string, FigmaComponent>;
      componentSets: Record<string, FigmaComponentSet>;
      styles: Record<string, FigmaStyle>;
      schemaVersion: number;
    }>;
  }>> {
    const params = new URLSearchParams({
      ids: nodeIds.join(","),
    });

    if (options?.version) params.append("version", options.version);
    if (options?.depth) params.append("depth", options.depth.toString());
    if (options?.geometry) params.append("geometry", options.geometry);
    if (options?.plugin_data) params.append("plugin_data", options.plugin_data);

    const response = await fetch(
      `https://api.figma.com/v1/files/${fileKey}/nodes?${params}`,
      { headers: this.headers }
    );

    return response.json();
  }

  /**
   * @description Renderiza imagens de um arquivo
   * @param fileKey Chave do arquivo
   * @param nodeIds IDs dos nós
   * @param options Opções da renderização
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
    }
  ): Promise<FigmaResponse<{
    images: Record<string, string | null>;
  }>> {
    const params = new URLSearchParams({
      ids: nodeIds.join(","),
    });

    if (options?.scale) params.append("scale", options.scale.toString());
    if (options?.format) params.append("format", options.format);
    if (options?.svg_outline_text !== undefined) 
      params.append("svg_outline_text", options.svg_outline_text.toString());
    if (options?.svg_include_id !== undefined)
      params.append("svg_include_id", options.svg_include_id.toString());
    if (options?.svg_include_node_id !== undefined)
      params.append("svg_include_node_id", options.svg_include_node_id.toString());
    if (options?.svg_simplify_stroke !== undefined)
      params.append("svg_simplify_stroke", options.svg_simplify_stroke.toString());
    if (options?.contents_only !== undefined)
      params.append("contents_only", options.contents_only.toString());
    if (options?.use_absolute_bounds !== undefined)
      params.append("use_absolute_bounds", options.use_absolute_bounds.toString());
    if (options?.version)
      params.append("version", options.version);

    const response = await fetch(
      `https://api.figma.com/v1/images/${fileKey}?${params}`,
      { headers: this.headers }
    );

    return response.json();
  }

  /**
   * @description Obtém URLs de download para todas as imagens presentes em image fills
   * @param fileKey Chave do arquivo
   */
  async getImageFills(
    fileKey: string
  ): Promise<FigmaResponse<{
    images: Record<string, string>;
  }>> {
    const response = await fetch(
      `https://api.figma.com/v1/files/${fileKey}/images`,
      { headers: this.headers }
    );

    return response.json();
  }
} 