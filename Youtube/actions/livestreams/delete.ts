import type { AppContext } from "../../mod.ts";

export interface DeleteLiveBroadcastParams {
  /**
   * @description ID da transmissão ao vivo a ser excluída
   */
  broadcastId: string;
}

export interface DeleteLiveBroadcastResult {
  success: boolean;
  message: string;
  error?: unknown;
}

/**
 * @title Excluir Transmissão ao Vivo
 * @description Remove uma transmissão ao vivo do YouTube
 */
export default async function action(
  props: DeleteLiveBroadcastParams,
  _req: Request,
  ctx: AppContext,
): Promise<DeleteLiveBroadcastResult> {
  const {
    broadcastId,
  } = props;

  if (!broadcastId) {
    return {
      success: false,
      message: "ID da transmissão é obrigatório",
    };
  }

  try {
    // Construir a URL para exclusão
    const url = new URL(
      "https://youtube.googleapis.com/youtube/v3/liveBroadcasts",
    );

    // Adicionar parâmetro de ID
    url.searchParams.append("id", broadcastId);

    // Fazer a requisição para excluir a transmissão
    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${ctx.access_token}`,
      },
    });

    // A API retorna 204 No Content quando a exclusão é bem-sucedida
    if (response.status === 204) {
      return {
        success: true,
        message: "Transmissão excluída com sucesso",
      };
    }

    // Se a resposta não for 204, temos um erro
    const errorData = await response.text();
    console.error("Erro ao excluir transmissão:", errorData);

    return {
      success: false,
      message:
        `Erro ao excluir transmissão: ${response.status} ${response.statusText}`,
      error: errorData,
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
