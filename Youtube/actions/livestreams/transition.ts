import type { AppContext } from "../../mod.ts";
import { LiveBroadcast } from "../../utils/types.ts";

export type BroadcastTransitionType =
  | "testing" // Coloca a transmissão em modo de teste
  | "live" // Inicia a transmissão ao vivo para todos
  | "complete"; // Finaliza a transmissão

export interface TransitionBroadcastParams {
  /**
   * @description ID da transmissão ao vivo
   */
  broadcastId: string;

  /**
   * @description Tipo de transição a ser aplicada
   */
  transitionType: BroadcastTransitionType;
}

export interface TransitionBroadcastResult {
  success: boolean;
  message: string;
  broadcast?: LiveBroadcast;
  error?: unknown;
}

/**
 * @title Alterar Status da Transmissão
 * @description Altera o status de uma transmissão ao vivo (iniciar teste, ir ao vivo, finalizar)
 */
export default async function action(
  props: TransitionBroadcastParams,
  _req: Request,
  ctx: AppContext,
): Promise<TransitionBroadcastResult> {
  const {
    broadcastId,
    transitionType,
  } = props;

  if (!broadcastId) {
    return {
      success: false,
      message: "ID da transmissão é obrigatório",
    };
  }

  // Validar o tipo de transição
  if (!["testing", "live", "complete"].includes(transitionType)) {
    return {
      success: false,
      message:
        "Tipo de transição inválido. Use 'testing', 'live' ou 'complete'",
    };
  }

  try {
    // Construir a URL para a transição
    const url = new URL(
      "https://youtube.googleapis.com/youtube/v3/liveBroadcasts/transition",
    );

    // Adicionar parâmetros obrigatórios
    url.searchParams.append("id", broadcastId);
    url.searchParams.append("broadcastStatus", transitionType);
    url.searchParams.append("part", "id,snippet,contentDetails,status");

    // Fazer a requisição para alterar o status
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ctx.access_token}`,
        "Content-Length": "0", // Requisição sem corpo
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Erro ao transicionar para ${transitionType}:`, errorData);

      // Mensagens de erro específicas para cada tipo de transição
      let errorMessage =
        `Erro ao alterar status para ${transitionType}: ${response.status} ${response.statusText}`;

      if (transitionType === "testing" && response.status === 400) {
        errorMessage =
          "Erro ao iniciar teste: verifique se a transmissão está no estado 'ready' e se foi vinculada a um stream.";
      } else if (transitionType === "live" && response.status === 400) {
        errorMessage =
          "Erro ao ir ao vivo: verifique se a transmissão está no estado 'testing' e se o streaming está ativo.";
      } else if (transitionType === "complete" && response.status === 400) {
        errorMessage =
          "Erro ao finalizar: verifique se a transmissão está no estado 'live' ou 'testing'.";
      }

      return {
        success: false,
        message: errorMessage,
        error: errorData,
      };
    }

    const broadcast = await response.json();

    // Mensagens de sucesso específicas para cada tipo de transição
    let successMessage = "";
    if (transitionType === "testing") {
      successMessage = "Transmissão colocada em modo de teste com sucesso";
    } else if (transitionType === "live") {
      successMessage = "Transmissão iniciada ao vivo com sucesso";
    } else if (transitionType === "complete") {
      successMessage = "Transmissão finalizada com sucesso";
    }

    return {
      success: true,
      message: successMessage,
      broadcast,
    };
  } catch (error) {
    console.error(`Erro ao transicionar para ${transitionType}:`, error);
    return {
      success: false,
      message: `Erro ao alterar status da transmissão: ${
        error.message || "Erro desconhecido"
      }`,
      error,
    };
  }
}
