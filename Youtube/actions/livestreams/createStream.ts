import type { AppContext } from "../../mod.ts";
import { LiveStream } from "../../utils/types.ts";

export interface CreateLiveStreamParams {
  /**
   * @description Título do stream
   */
  title: string;

  /**
   * @description Descrição do stream
   */
  description?: string;

  /**
   * @description Tipo de ingestão, RTMP é o padrão mais comum
   */
  ingestionType?: "rtmp" | "dash" | "webrtc";

  /**
   * @description Resolução, como "1080p", "720p", etc.
   */
  resolution?: string;

  /**
   * @description Taxa de quadros, como "30fps", "60fps"
   */
  frameRate?: string;

  /**
   * @description Indica se o stream pode ser reutilizado para várias transmissões
   */
  isReusable?: boolean;
}

export interface CreateLiveStreamResult {
  success: boolean;
  message: string;
  stream?: LiveStream;
  error?: unknown;
}

/**
 * @title Criar Stream de Vídeo
 * @description Cria um novo stream de vídeo para usar em transmissões ao vivo
 */
export default async function action(
  props: CreateLiveStreamParams,
  _req: Request,
  ctx: AppContext,
): Promise<CreateLiveStreamResult> {
  const {
    title,
    description = "",
    ingestionType = "rtmp",
    resolution = "1080p",
    frameRate = "60fps",
    isReusable = true,
  } = props;

  if (!title) {
    return {
      success: false,
      message: "Título do stream é obrigatório",
    };
  }

  try {
    // Preparar payload para criar o stream
    const payload = {
      snippet: {
        title,
        description,
      },
      cdn: {
        ingestionType,
        resolution,
        frameRate,
      },
      contentDetails: {
        isReusable,
      },
    };

    // Criar o stream
    const url =
      "https://youtube.googleapis.com/youtube/v3/liveStreams?part=id,snippet,cdn,contentDetails,status";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ctx.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erro ao criar stream:", errorData);
      return {
        success: false,
        message:
          `Erro ao criar stream: ${response.status} ${response.statusText}`,
        error: errorData,
      };
    }

    const stream = await response.json();

    return {
      success: true,
      message: "Stream criado com sucesso",
      stream,
    };
  } catch (error: unknown) {
    let message = "Erro desconhecido";
    if (error instanceof Error) {
      message = error.message;
    }
    return {
      success: false,
      message: `Erro ao criar stream: ${message}`,
    };
  }
}
