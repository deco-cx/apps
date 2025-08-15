import type { AppContext } from "../mod.ts";
import type {
  FigmaComponent,
  FigmaComponentSet,
  FigmaNode,
  FigmaResponse,
  FigmaStyle,
} from "../utils/client.ts";
import {
  simplifyComponent,
  simplifyComponentSet,
  simplifyDocument,
  simplifyStyle,
} from "../utils/simplifier.ts";

export interface Props {
  /**
   * @description The Figma file key to get information from
   * @example "FpnkfUhKcNS9S4JQFJexL"
   */
  fileKey: string;

  /**
   * @description Specific version of the file (optional)
   */
  version?: string;

  /**
   * @description Depth of the document tree (optional)
   */
  depth?: number;

  /**
   * @description Include branch data (optional)
   */
  branch_data?: boolean;
}

interface SimplifiedResponse {
  name: string;
  role: string;
  lastModified: string;
  editorType: string;
  thumbnailUrl: string;
  version: string;
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  componentSets: Record<string, FigmaComponentSet>;
  styles: Record<string, FigmaStyle>;
}

/**
 * @name FILE_SIMPLIFIED
 * @title Simplified File
 * @description Gets a simplified version of the data from a Figma file, including only the most relevant information
 */
export default async function getFileSimplified(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FigmaResponse<SimplifiedResponse>> {
  const { fileKey, version, depth, branch_data } = props;
  const response = await ctx.client["GET /v1/files/:fileKey"]({
    fileKey,
    version,
    depth,
    branch_data,
  });

  if (!response.ok) {
    return {
      err: `HTTP ${response.status}: ${response.statusText}`,
      status: response.status,
    };
  }

  const data = await response.json();

  // Simplify the data
  const simplifiedComponents: Record<string, FigmaComponent> = {};
  for (
    const [key, component] of Object.entries(data.components || {})
  ) {
    const simplified = simplifyComponent(component);
    if (simplified) {
      simplifiedComponents[key] = simplified as FigmaComponent;
    }
  }

  const simplifiedComponentSets: Record<string, FigmaComponentSet> = {};
  for (
    const [key, componentSet] of Object.entries(
      data.componentSets || {},
    )
  ) {
    const simplified = simplifyComponentSet(componentSet);
    if (simplified) {
      simplifiedComponentSets[key] = simplified as FigmaComponentSet;
    }
  }

  const simplifiedStyles: Record<string, FigmaStyle> = {};
  for (const [key, style] of Object.entries(data.styles || {})) {
    const simplified = simplifyStyle(style);
    if (simplified) {
      simplifiedStyles[key] = simplified as FigmaStyle;
    }
  }

  const simplifiedDoc = simplifyDocument(data.document);
  if (!simplifiedDoc) {
    throw new Error("Failed to simplify document");
  }

  // Return the simplified data
  return {
    status: response.status,
    data: {
      name: data.name,
      role: data.role,
      lastModified: data.lastModified,
      editorType: data.editorType,
      thumbnailUrl: data.thumbnailUrl,
      version: data.version,
      document: simplifiedDoc as FigmaNode,
      components: simplifiedComponents,
      componentSets: simplifiedComponentSets,
      styles: simplifiedStyles,
    },
  };
}
