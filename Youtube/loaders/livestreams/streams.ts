import type { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import type { LiveStreamListResponse } from "../../utils/types.ts";

export interface ListLiveStreamsParams {
  /**
   * @description Token de autenticação do YouTube (opcional)
   */
  tokenYoutube?: string;

  /**
   * @description Filtrar por IDs específicos de streams
   */
  streamId?: string;

  /**
   * @description Filtrar streams do canal autenticado (true)
   */
  mine?: boolean;

  /**
   * @description Máximo de resultados a serem retornados
   */
  maxResults?: number;

  /**
   * @description Token para a próxima página de resultados
   */
  pageToken?: string;
}

export interface LiveStreamListErrorResponse {
  error: true;
  message: string;
  details?: unknown;
  code?: number;
}

/**
 * @title Listar Streams de Vídeo
 * @description Recupera uma lista de recursos de stream de vídeo para o canal autenticado
 */
export default async function loader(
  props: ListLiveStreamsParams,
  req: Request,
  _ctx: AppContext,
): Promise<LiveStreamListResponse | LiveStreamListErrorResponse> {
  const {
    streamId,
    mine = true,
    maxResults = 25,
    pageToken,
  } = props;

  //const client = ctx.client;
  const accessToken = props.tokenYoutube || getAccessToken(req);

  if (!accessToken) {
    return {
      error: true,
      message:
        "Autenticação necessária para listar streams. O token de acesso não foi encontrado.",
    };
  }

  try {
    // Construir a URL manualmente
    const baseUrl = "https://youtube.googleapis.com/youtube/v3/liveStreams";
    const url = new URL(baseUrl);

    // Definir parâmetros comuns
    url.searchParams.append("part", "id,snippet,cdn,status,contentDetails");
    url.searchParams.append("maxResults", maxResults.toString());

    // Verificar parâmetros mutuamente exclusivos
    if (streamId) {
      url.searchParams.append("id", streamId);
    } else if (mine) {
      url.searchParams.append("mine", "true");
    } else {
      return {
        error: true,
        message:
          "Parâmetros inválidos: pelo menos um dos parâmetros streamId ou mine deve ser especificado",
      };
    }

    // Adicionar parâmetros opcionais
    if (pageToken) {
      url.searchParams.append("pageToken", pageToken);
    }

    // Fazer a requisição à API
    const response = await fetch(
      url.toString(),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    // Verificar se a resposta é ok antes de converter para JSON
    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;

      try {
        // Tentar extrair mais detalhes do erro se for um JSON
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = errorText;
      }

      console.error(
        `Erro HTTP ${response.status} ao listar streams:`,
        errorDetails,
      );

      // Mensagens personalizadas para códigos de erro comuns
      let mensagem =
        `Erro ao listar streams: ${response.status} ${response.statusText}`;

      if (response.status === 401) {
        mensagem =
          "Token de autenticação inválido ou expirado. Faça login novamente.";
      } else if (response.status === 403) {
        mensagem =
          "Acesso negado. Verifique se você tem permissão para listar streams e o escopo 'youtube.livestream' está autorizado.";
      } else if (response.status === 404) {
        mensagem =
          "Recurso não encontrado. Verifique se os IDs dos streams estão corretos.";
      } else if (response.status === 400) {
        mensagem = "Solicitação inválida. Verifique os parâmetros enviados.";
      } else if (response.status === 500) {
        mensagem =
          "Erro interno do servidor YouTube. Tente novamente mais tarde.";
      } else if (response.status === 429) {
        mensagem =
          "Limite de requisições excedido. Aguarde um momento e tente novamente.";
      }

      return {
        error: true,
        message: mensagem,
        details: errorDetails,
        code: response.status,
      };
    }

    const data = await response.json();

    // Verificar erros no formato de resposta da API
    if (data.error) {
      console.error("Erro na API do YouTube:", data.error);

      let mensagem = "Erro na API do YouTube";
      if (data.error.message) {
        mensagem = `Erro na API do YouTube: ${data.error.message}`;
      }

      return {
        error: true,
        message: mensagem,
        details: data.error,
        code: data.error.code,
      };
    }

    // Verificar se a resposta contém a estrutura esperada
    if (!data.items) {
      return {
        kind: "youtube#liveStreamListResponse",
        etag: "",
        items: [],
        pageInfo: {
          totalResults: 0,
          resultsPerPage: 0,
        },
      };
    }

    // Verificar se não encontrou resultados
    if (data.items.length === 0) {
      return {
        kind: "youtube#liveStreamListResponse",
        etag: data.etag || "",
        items: [],
        pageInfo: data.pageInfo || {
          totalResults: 0,
          resultsPerPage: 0,
        },
        infoMessage:
          "Nenhum stream de vídeo encontrado. Para transmissões ao vivo, você precisa primeiro configurar um stream de vídeo no canal.",
      };
    }

    return data;
  } catch (error) {
    console.error("Erro ao listar streams:", error);
    return {
      error: true,
      message: `Erro inesperado ao listar streams: ${
        error.message || "Erro desconhecido"
      }`,
      details: error,
    };
  }
}
