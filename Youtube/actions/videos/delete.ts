import type { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";

/**
 * Opções para exclusão de vídeo
 */
export interface DeleteVideoParams {
  /**
   * @description ID do vídeo a ser excluído
   */
  videoId: string;

  /**
   * @description Token de autorização do YouTube (opcional)
   */
  tokenYoutube?: string;

  /**
   * @description Ignorar erros não fatais (opcional)
   */
  onBehalfOfContentOwner?: string;
}

export interface DeleteVideoResult {
  success: boolean;
}

export interface DeleteVideoError {
  message: string;
  error: boolean;
  code?: number;
  details?: unknown;
}

export type DeleteVideoResponse = DeleteVideoResult | DeleteVideoError;

/**
 * @title Delete Video
 * @description Removes a video from the YouTube channel
 */
export default async function action(
  props: DeleteVideoParams,
  req: Request,
  ctx: AppContext,
): Promise<DeleteVideoResponse> {
  const client = ctx.client;
  const {
    videoId,
    tokenYoutube,
    onBehalfOfContentOwner,
  } = props;

  const accessToken = tokenYoutube || getAccessToken(req);

  if (!accessToken) {
    return createErrorResponse(401, "Token de autenticação não encontrado");
  }

  if (!videoId) {
    return createErrorResponse(400, "ID do vídeo é obrigatório");
  }

  try {
    // Fazer a requisição para excluir o vídeo
    const response = await client["DELETE /videos"](
      {
        id: videoId,
        onBehalfOfContentOwner,
      },
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      },
    );

    // A API retorna 204 No Content quando a exclusão é bem-sucedida
    if (response.status === 204) {
      return {
        success: true,
      };
    }

    // Se a resposta não for 204, temos um erro
    let errorText = await response.text();
    let errorDetails;

    try {
      // Tentar extrair mais detalhes do erro se for um JSON
      errorDetails = JSON.parse(errorText);
    } catch {
      errorDetails = errorText;
    }

    // Mensagens personalizadas para códigos de erro comuns
    if (response.status === 401) {
      return createErrorResponse(
        401,
        "Token de autenticação inválido ou expirado. Faça login novamente.",
        errorDetails,
      );
    } else if (response.status === 403) {
      return createErrorResponse(
        403,
        "Acesso negado. Verifique se você tem permissão para excluir este vídeo.",
        errorDetails,
      );
    } else if (response.status === 404) {
      return createErrorResponse(
        404,
        "Vídeo não encontrado. O ID do vídeo pode estar incorreto ou o vídeo já foi excluído.",
        errorDetails,
      );
    } else if (response.status === 400) {
      return createErrorResponse(
        400,
        "Solicitação inválida. Verifique os parâmetros enviados.",
        errorDetails,
      );
    }

    return createErrorResponse(
      response.status,
      `Erro ao excluir vídeo: ${response.status} ${response.statusText}`,
      errorDetails,
    );
  } catch (error) {
    return createErrorResponse(
      500,
      "Erro ao processar exclusão do vídeo",
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
): DeleteVideoError {
  return {
    message,
    error: true,
    code,
    details,
  };
}
