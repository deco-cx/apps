import type { AppContext } from "../mod.ts";
import type { FigmaResponse } from "../client.ts";
import {
  simplifyComponent,
  simplifyComponentSet,
  simplifyDocument,
  simplifyStyle,
} from "../utils/simplifier.ts";

export interface Props {
  /**
   * @description A chave do arquivo Figma para obter informações
   * @example "FpnkfUhKcNS9S4JQFJexL"
   */
  fileKey: string;

  /**
   * @description Versão específica do arquivo (opcional)
   */
  version?: string;

  /**
   * @description Profundidade da árvore do documento (opcional)
   */
  depth?: number;

  /**
   * @description Incluir dados de branches (opcional)
   */
  branch_data?: boolean;
}

/**
 * @name FILE_SIMPLIFIED
 * @title Arquivo Simplificado
 * @description Obtém uma versão simplificada dos dados de um arquivo do Figma, incluindo apenas as informações mais relevantes
 */
export default async function getFileSimplified(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<
  FigmaResponse<{
    name: string;
    role: string;
    lastModified: string;
    editorType: string;
    thumbnailUrl: string;
    version: string;
    document: any;
    components: Record<string, any>;
    componentSets: Record<string, any>;
    styles: Record<string, any>;
  }>
> {
  const { fileKey, version, depth, branch_data } = props;
  const response = await ctx.figma.getFile(fileKey, {
    version,
    depth,
    branch_data,
  });

  // Se houver erro na resposta, retorna a resposta original
  if (response.err) {
    return response;
  }

  // Se não houver dados, retorna a resposta original
  if (!response.data) {
    return response;
  }

  // Simplifica os dados
  const simplifiedComponents: Record<string, any> = {};
  for (const [key, component] of Object.entries(response.data.components)) {
    simplifiedComponents[key] = simplifyComponent(component);
  }

  const simplifiedComponentSets: Record<string, any> = {};
  for (
    const [key, componentSet] of Object.entries(response.data.componentSets)
  ) {
    simplifiedComponentSets[key] = simplifyComponentSet(componentSet);
  }

  const simplifiedStyles: Record<string, any> = {};
  for (const [key, style] of Object.entries(response.data.styles)) {
    simplifiedStyles[key] = simplifyStyle(style);
  }

  // Retorna os dados simplificados
  return {
    ...response,
    data: {
      name: response.data.name,
      role: response.data.role,
      lastModified: response.data.lastModified,
      editorType: response.data.editorType,
      thumbnailUrl: response.data.thumbnailUrl,
      version: response.data.version,
      document: simplifyDocument(response.data.document),
      components: simplifiedComponents,
      componentSets: simplifiedComponentSets,
      styles: simplifiedStyles,
    },
  };
}
