import { LiveBroadcast } from "../../utils/types.ts";

export interface UpdateLiveBroadcastThumbnailParams {
  /**
   * @description ID da transmissão ao vivo
   */
  broadcastId: string;

  /**
   * @description URL da imagem ou base64 da imagem para a miniatura
   */
  thumbnailUrl?: string;

  /**
   * @description Dados binários da imagem (se não usar URL)
   */
  thumbnailData?: Uint8Array;

  /**
   * @description Tipo MIME da imagem (e.g., 'image/jpeg', 'image/png')
   */
  mimeType?: string;
}

export interface UpdateLiveBroadcastThumbnailResult {
  success: boolean;
  message: string;
  broadcast?: LiveBroadcast;
  thumbnails?: Record<string, unknown>;
  error?: unknown;
}

/**
 * @title Atualizar Miniatura da Transmissão
 * @description Atualiza a miniatura de uma transmissão ao vivo no YouTube
 */
export default async function action(
  props: UpdateLiveBroadcastThumbnailParams,
  _req: Request,
): Promise<UpdateLiveBroadcastThumbnailResult> {
  const {
    broadcastId,
    thumbnailUrl,
    thumbnailData,
    mimeType = "image/jpeg",
  } = props;

  if (!broadcastId) {
    return {
      success: false,
      message: "ID da transmissão é obrigatório",
    };
  }

  if (!thumbnailUrl && !thumbnailData) {
    return {
      success: false,
      message: "É necessário fornecer URL ou dados da imagem",
    };
  }

  try {
    let imageData: Uint8Array;

    // Obter os dados da imagem, seja de URL ou diretamente
    if (thumbnailUrl) {
      const imageResponse = await fetch(thumbnailUrl);
      if (!imageResponse.ok) {
        return {
          success: false,
          message:
            `Erro ao baixar imagem da URL: ${imageResponse.status} ${imageResponse.statusText}`,
        };
      }

      const buffer = await imageResponse.arrayBuffer();
      imageData = new Uint8Array(buffer);
    } else if (thumbnailData) {
      imageData = thumbnailData;
    } else {
      return {
        success: false,
        message: "Dados da imagem não disponíveis",
      };
    }

    // Construir a URL para upload da miniatura
    const url = new URL(
      `https://youtube.googleapis.com/upload/youtube/v3/liveBroadcasts/thumbnails`,
    );
    url.searchParams.append("uploadType", "media");
    url.searchParams.append("broadcastId", broadcastId);

    // Enviar a imagem
    const uploadResponse = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": mimeType,
        "Content-Length": imageData.length.toString(),
      },
      body: imageData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text();
      console.error("Erro ao enviar miniatura:", errorData);
      return {
        success: false,
        message:
          `Erro ao enviar miniatura: ${uploadResponse.status} ${uploadResponse.statusText}`,
        error: errorData,
      };
    }

    const responseData = await uploadResponse.json();

    return {
      success: true,
      message: "Miniatura atualizada com sucesso",
      thumbnails: responseData.items?.[0] || responseData,
    };
  } catch (error: unknown) {
    let message = "Erro desconhecido";
    if (error instanceof Error) {
      message = error.message;
    }
    return {
      success: false,
      message,
    };
  }
}
