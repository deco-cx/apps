import type { UpdateThumbnailResponse } from "../../utils/types.ts";
import { AppContext } from "../../mod.ts";

/**
 * Opções para atualização de thumbnail de vídeo
 */
export interface UpdateThumbnailOptions {
  /**
   * @description ID do vídeo do YouTube
   */
  videoId: string;

  /**
   * @description URL da imagem ou dados base64 da imagem para o thumbnail
   */
  imageData?: string;

  /**
   * @description Dados base64 da imagem para o thumbnail
   */
  imageBase64?: string;
}

export interface ThumbnailUpdateResult {
  success: boolean;
  thumbnail: UpdateThumbnailResponse;
}

export interface ThumbnailUpdateError {
  message: string;
  error: boolean;
  code?: number;
  details?: unknown;
}

export type ThumbnailResponse = ThumbnailUpdateResult | ThumbnailUpdateError;

/**
 * @title Update YouTube Video Thumbnail
 * @description Updates the custom thumbnail for a YouTube video
 */
export default async function action(
  props: UpdateThumbnailOptions,
  req: Request,
  ctx: AppContext,
): Promise<ThumbnailResponse> {
  const client = ctx.client;
  const { videoId, imageData, imageBase64 } = props;

  // Validar dados
  if (!videoId) {
    return createErrorResponse(400, "ID do vídeo é obrigatório");
  }

  if (!imageData && !imageBase64) {
    return createErrorResponse(400, "Dados da imagem são obrigatórios");
  }

  try {
    // Preparar o arquivo/blob para upload
    let imageBlob: Blob;

    if (imageData && typeof imageData === "string") {
      // Se for uma string base64, converter para Blob
      const base64Data = imageData.split(",")[1] || imageData;
      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }

      const byteArray = new Uint8Array(byteArrays);
      imageBlob = new Blob([byteArray], { type: "image/jpeg" });
    } else if (!imageBase64) {
      return createErrorResponse(400, "Formato de imagem inválido");
    }

    // Enviar a requisição para atualizar o thumbnail
    const updateResponse = await fetch(
      `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}&uploadType=media`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${client.accessToken}`,
          "Content-Type": "image/jpeg, image/png, image/webp",
        },
        body: imageBase64 ? imageBase64 : imageBlob!,
      },
    );

    if (!updateResponse.ok) {
      return createErrorResponse(
        updateResponse.status,
        `Erro ao atualizar thumbnail: ${updateResponse.status}`,
        await updateResponse.text(),
      );
    }

    const thumbnailData = await updateResponse.json();

    return {
      success: true,
      thumbnail: thumbnailData,
    };
  } catch (error) {
    return createErrorResponse(
      500,
      "Erro ao processar atualização do thumbnail",
      error instanceof Error ? error.message : String(error),
    );
  }
}

/**
 * Função auxiliar para criar respostas de erro
 */
function createErrorResponse(
  code: number,
  message: string,
  details?: unknown,
): ThumbnailUpdateError {
  return {
    message,
    error: true,
    code,
    details,
  };
}
