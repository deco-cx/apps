import { LiveBroadcast } from "../../utils/types.ts";
import type { AppContext } from "../../mod.ts";

export interface BindStreamParams {
  /**
   * @description ID da transmissão ao vivo
   */
  broadcastId: string;

  /**
   * @description ID do stream de vídeo
   */
  streamId: string;
}

export interface BindStreamResult {
  success: boolean;
  message: string;
  broadcast?: LiveBroadcast;
  error?: unknown;
}

/**
 * @title Bind Stream to Broadcast
 * @description Links a video stream to a live broadcast
 */
export default async function action(
  props: BindStreamParams,
  _req: Request,
  ctx: AppContext,
): Promise<BindStreamResult> {
  const {
    broadcastId,
    streamId,
  } = props;

  if (!broadcastId) {
    return {
      success: false,
      message: "ID da transmissão é obrigatório",
    };
  }

  if (!streamId) {
    return {
      success: false,
      message: "ID do stream é obrigatório",
    };
  }

  try {
    // Construir a URL para vincular o stream à transmissão
    const url = new URL(
      "https://youtube.googleapis.com/youtube/v3/liveBroadcasts/bind",
    );

    // Adicionar parâmetros obrigatórios
    url.searchParams.append("id", broadcastId);
    url.searchParams.append("streamId", streamId);
    url.searchParams.append("part", "id,snippet,contentDetails,status");

    // Fazer a requisição para vincular
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ctx.access_token}`,
        "Content-Length": "0", // Requisição sem corpo
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erro ao vincular stream:", errorData);
      return {
        success: false,
        message:
          `Erro ao vincular stream: ${response.status} ${response.statusText}`,
        error: errorData,
      };
    }

    const broadcast = await response.json();

    return {
      success: true,
      message: "Stream vinculado com sucesso à transmissão",
      broadcast,
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
