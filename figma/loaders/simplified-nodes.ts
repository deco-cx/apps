import type { AppContext } from "../mod.ts";
import type { FigmaResponse, FigmaNode } from "../client.ts";
import { simplifyNode } from "../utils/simplifier.ts";

export interface Props {
  /**
   * @description A chave do arquivo Figma para obter informações
   * @example "FpnkfUhKcNS9S4JQFJexL"
   */
  fileKey: string;

  /**
   * @description IDs dos nós que você deseja obter
   * @example ["1:2", "1:3"]
   */
  nodeIds: string[];

  /**
   * @description Versão específica do arquivo (opcional)
   */
  version?: string;

  /**
   * @description Profundidade da árvore do documento (opcional)
   */
  depth?: number;

  /**
   * @description Incluir dados de geometria (opcional)
   */
  geometry?: "paths";
}

/**
 * @name FILE_SIMPLIFIED_NODES
 * @title Nós Simplificados do Arquivo
 * @description Obtém nós específicos de um arquivo do Figma em formato simplificado
 */
export default async function getFileSimplifiedNodes(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FigmaResponse<{
  nodes: Record<string, {
    document: any;
    components: Record<string, any>;
    componentSets: Record<string, any>;
    styles: Record<string, any>;
    schemaVersion: number;
  }>;
}>> {
  const { fileKey, nodeIds, version, depth, geometry } = props;
  const response = await ctx.figma.getFileNodes(fileKey, nodeIds, {
    version,
    depth,
    geometry,
  });
  
  // Se houver erro na resposta, retorna a resposta original
  if (response.err) {
    return response;
  }
  
  // Se não houver dados, retorna a resposta original
  if (!response.data) {
    return response;
  }
  
  // Simplifica os nós
  const simplifiedNodes: Record<string, any> = {};
  
  for (const [nodeId, nodeData] of Object.entries(response.data.nodes)) {
    if (!nodeData) continue;
    
    simplifiedNodes[nodeId] = {
      document: simplifyNode(nodeData.document),
      components: nodeData.components,
      componentSets: nodeData.componentSets,
      styles: nodeData.styles,
      schemaVersion: nodeData.schemaVersion,
    };
  }
  
  // Retorna os nós simplificados
  return {
    ...response,
    data: {
      nodes: simplifiedNodes,
    },
  };
} 