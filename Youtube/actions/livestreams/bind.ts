import type { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import { LiveBroadcast } from "../../utils/types.ts";

export interface BindStreamParams {
  /**
   * @description ID da transmissão ao vivo
   */
  broadcastId: string;

  /**
   * @description ID do stream de vídeo
   */
  streamId: string;

  /**
   * @description Token de autorização do YouTube (opcional)
   */
  tokenYoutube?: string;
}

export interface BindStreamResult {
  success: boolean;
  message: string;
  broadcast?: LiveBroadcast;
  error?: unknown;
}

/**
 * @title Vincular Stream à Transmissão
 * @description Vincula um stream de vídeo a uma transmissão ao vivo
 */
export default async function action(
  props: BindStreamParams,
  req: Request,
  _ctx: AppContext,
): Promise<BindStreamResult> {
  const {
    broadcastId,
    streamId,
    tokenYoutube,
  } = props;

  const accessToken = tokenYoutube || getAccessToken(req);

  if (!accessToken) {
    return {
      success: false,
      message: "Token de autenticação não encontrado",
    };
  }

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
        "Authorization": `Bearer ${accessToken}`,
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
  } catch (error) {
    console.error("Erro ao vincular stream:", error);
    return {
      success: false,
      message: `Erro ao vincular stream: ${
        error.message || "Erro desconhecido"
      }`,
      error,
    };
  }
}
