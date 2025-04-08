import type { AppContext } from "../mod.ts";
import type { FigmaResponse, FigmaFile } from "../client.ts";

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
 * @name FILE_PROFILE
 * @title Perfil do Arquivo
 * @description Obtém informações detalhadas sobre um arquivo do Figma, incluindo metadados, documento e componentes
 */
export default async function getFileProfile(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FigmaResponse<FigmaFile>> {
  const { fileKey, version, depth, branch_data } = props;
  return await ctx.figma.getFile(fileKey, {
    version,
    depth,
    branch_data,
  });
} 