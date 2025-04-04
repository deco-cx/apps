import type { AppContext } from "../../mod.ts";
import getAccessToken from "../../utils/getAccessToken.ts";

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
  message: string;
  error?: any;
}

/**
 * @title Excluir Vídeo
 * @description Remove um vídeo do canal do YouTube
 */
export default async function action(
  props: DeleteVideoParams,
  req: Request,
  _ctx: AppContext,
): Promise<DeleteVideoResult> {
  const {
    videoId,
    tokenYoutube,
    onBehalfOfContentOwner,
  } = props;

  const accessToken = tokenYoutube || getAccessToken(req);

  if (!accessToken) {
    return {
      success: false,
      message: "Token de autenticação não encontrado",
    };
  }

  if (!videoId) {
    return {
      success: false,
      message: "ID do vídeo é obrigatório",
    };
  }

  try {
    // Construir a URL para exclusão
    const url = new URL("https://youtube.googleapis.com/youtube/v3/videos");

    // Adicionar parâmetro de ID
    url.searchParams.append("id", videoId);

    // Adicionar parâmetro opcional para proprietários de conteúdo
    if (onBehalfOfContentOwner) {
      url.searchParams.append("onBehalfOfContentOwner", onBehalfOfContentOwner);
    }

    // Fazer a requisição para excluir o vídeo
    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    // A API retorna 204 No Content quando a exclusão é bem-sucedida
    if (response.status === 204) {
      return {
        success: true,
        message: "Vídeo excluído com sucesso",
      };
    }

    // Se a resposta não for 204, temos um erro
    const errorText = await response.text();
    let errorData;

    try {
      // Tentar extrair mais detalhes do erro se for um JSON
      errorData = JSON.parse(errorText);
    } catch {
      errorData = errorText;
    }

    console.error("Erro ao excluir vídeo:", errorData);

    // Mensagens personalizadas para códigos de erro comuns
    let mensagem =
      `Erro ao excluir vídeo: ${response.status} ${response.statusText}`;

    if (response.status === 401) {
      mensagem =
        "Token de autenticação inválido ou expirado. Faça login novamente.";
    } else if (response.status === 403) {
      mensagem =
        "Acesso negado. Verifique se você tem permissão para excluir este vídeo.";
    } else if (response.status === 404) {
      mensagem =
        "Vídeo não encontrado. O ID do vídeo pode estar incorreto ou o vídeo já foi excluído.";
    } else if (response.status === 400) {
      mensagem = "Solicitação inválida. Verifique os parâmetros enviados.";
    }

    return {
      success: false,
      message: mensagem,
      error: errorData,
    };
  } catch (error) {
    console.error("Erro ao excluir vídeo:", error);
    return {
      success: false,
      message: `Erro ao excluir vídeo: ${error.message || "Erro desconhecido"}`,
      error,
    };
  }
}
