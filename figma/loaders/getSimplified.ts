import type { AppContext } from "../mod.ts";
import type {
  FigmaComponent,
  FigmaComponentSet,
  FigmaNode,
  FigmaResponse,
  FigmaStyle,
} from "../client.ts";
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
  if (!ctx.figma) {
    throw new Error("Figma client not found");
  }
  const response = await ctx.figma.getFile(fileKey, {
    version,
    depth,
    branch_data,
  });

  // If there's an error in the response, return the original response
  if (response.err || !response.data) {
    return response;
  }

  // Simplify the data
  const simplifiedComponents: Record<string, FigmaComponent> = {};
  for (
    const [key, component] of Object.entries(response.data.components || {})
  ) {
    const simplified = simplifyComponent(component);
    if (simplified) {
      simplifiedComponents[key] = simplified as FigmaComponent;
    }
  }

  const simplifiedComponentSets: Record<string, FigmaComponentSet> = {};
  for (
    const [key, componentSet] of Object.entries(
      response.data.componentSets || {},
    )
  ) {
    const simplified = simplifyComponentSet(componentSet);
    if (simplified) {
      simplifiedComponentSets[key] = simplified as FigmaComponentSet;
    }
  }

  const simplifiedStyles: Record<string, FigmaStyle> = {};
  for (const [key, style] of Object.entries(response.data.styles || {})) {
    const simplified = simplifyStyle(style);
    if (simplified) {
      simplifiedStyles[key] = simplified as FigmaStyle;
    }
  }

  const simplifiedDoc = simplifyDocument(response.data.document);
  if (!simplifiedDoc) {
    throw new Error("Failed to simplify document");
  }

  // Return the simplified data
  return {
    ...response,
    data: {
      name: response.data.name,
      role: response.data.role,
      lastModified: response.data.lastModified,
      editorType: response.data.editorType,
      thumbnailUrl: response.data.thumbnailUrl,
      version: response.data.version,
      document: simplifiedDoc as FigmaNode,
      components: simplifiedComponents,
      componentSets: simplifiedComponentSets,
      styles: simplifiedStyles,
    },
  };
}
