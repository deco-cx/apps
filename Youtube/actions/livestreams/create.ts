import type { AppContext } from "../../mod.ts";
import {
  LiveBroadcast,
  LiveBroadcastPrivacyStatus,
} from "../../utils/types.ts";

export interface CreateLiveBroadcastParams {
  /**
   * @description Título da transmissão ao vivo
   */
  title: string;

  /**
   * @description Descrição da transmissão ao vivo
   */
  description?: string;

  /**
   * @description Data e hora agendada para início (formato ISO 8601)
   */
  scheduledStartTime: string;

  /**
   * @description Data e hora agendada para término (formato ISO 8601, opcional)
   */
  scheduledEndTime?: string;

  /**
   * @description Status de privacidade da transmissão
   */
  privacyStatus?: LiveBroadcastPrivacyStatus;

  /**
   * @description Habilitar DVR (permite ao espectador voltar no tempo durante a transmissão)
   */
  enableDvr?: boolean;

  /**
   * @description Habilitar início automático quando a transmissão estiver pronta
   */
  enableAutoStart?: boolean;

  /**
   * @description Habilitar encerramento automático quando a transmissão terminar
   */
  enableAutoStop?: boolean;

  /**
   * @description Transmissão é adequada para crianças
   */
  madeForKids?: boolean;
}

export interface CreateLiveBroadcastResult {
  success: boolean;
  message: string;
  broadcast?: LiveBroadcast;
  error?: unknown;
}

/**
 * @title Create Live Broadcast
 * @description Creates a new live broadcast on YouTube
 */
export default async function action(
  props: CreateLiveBroadcastParams,
  req: Request,
  ctx: AppContext,
): Promise<CreateLiveBroadcastResult> {
  const {
    title,
    description = "",
    scheduledStartTime,
    scheduledEndTime,
    privacyStatus = "private",
    enableDvr = true,
    enableAutoStart = false,
    enableAutoStop = false,
    madeForKids = false,
  } = props;

  if (!title) {
    return {
      success: false,
      message: "Título da transmissão é obrigatório",
    };
  }

  if (!scheduledStartTime) {
    return {
      success: false,
      message: "Data e hora de início são obrigatórias",
    };
  }

  try {
    // Verificar se a data agendada é válida (no futuro)
    const startTime = new Date(scheduledStartTime);
    const now = new Date();

    if (startTime < now) {
      return {
        success: false,
        message: "A data de início deve ser no futuro",
      };
    }

    if (scheduledEndTime) {
      const endTime = new Date(scheduledEndTime);
      if (endTime <= startTime) {
        return {
          success: false,
          message: "A data de término deve ser posterior à data de início",
        };
      }
    }

    // Preparar payload para criar a transmissão
    const payload = {
      snippet: {
        title,
        description,
        scheduledStartTime,
        scheduledEndTime,
      },
      status: {
        privacyStatus,
        selfDeclaredMadeForKids: madeForKids,
      },
      contentDetails: {
        enableDvr,
        enableAutoStart,
        enableAutoStop,
        enableEmbed: true,
        recordFromStart: true,
        startWithSlate: false,
      },
    };

    // Criar a transmissão
    const url =
      "https://youtube.googleapis.com/youtube/v3/liveBroadcasts?part=id,snippet,contentDetails,status";
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
      console.error("Erro ao criar transmissão:", errorData);
      return {
        success: false,
        message:
          `Erro ao criar transmissão: ${response.status} ${response.statusText}`,
        error: errorData,
      };
    }

    const broadcast = await response.json();

    return {
      success: true,
      message: "Transmissão criada com sucesso",
      broadcast,
    };
  } catch (error) {
    console.error("Erro ao criar transmissão:", error);
    return {
      success: false,
      message: `Erro ao criar transmissão: ${
        error.message || "Erro desconhecido"
      }`,
      error,
    };
  }
}
