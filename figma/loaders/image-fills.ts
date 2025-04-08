import type { AppContext } from "../mod.ts";
import type { FigmaResponse } from "../client.ts";

export interface Props {
  /**
   * @description A chave do arquivo Figma para obter informações
   * @example "FpnkfUhKcNS9S4JQFJexL"
   */
  fileKey: string;
}

/**
 * @name FILE_IMAGE_FILLS
 * @title Preenchimentos de Imagem do Arquivo
 * @description Obtém URLs de download para todas as imagens presentes em preenchimentos de imagem em um documento
 */
export default async function getFileImageFills(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FigmaResponse<{
  images: Record<string, string>;
}>> {
  const { fileKey } = props;
  return await ctx.figma.getImageFills(fileKey);
} 