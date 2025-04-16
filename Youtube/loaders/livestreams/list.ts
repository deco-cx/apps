import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import type { LiveBroadcastListResponse } from "../../utils/types.ts";

export interface ListLiveBroadcastsParams {
  /**
   * @description Token de autenticação do YouTube (opcional)
   */
  tokenYoutube?: string;

  /**
   * @description Filtrar por IDs específicos de transmissões
   */
  broadcastId?: string;

  /**
   * @description Filtrar transmissões do canal autenticado (true) ou de um canal específico
   */
  mine?: boolean;

  /**
   * @description ID do canal para buscar transmissões (apenas quando mine=false)
   */
  channelId?: string;

  /**
   * @description Estado do ciclo de vida das transmissões a serem retornadas
   */
  broadcastStatus?: "all" | "active" | "completed" | "upcoming";

  /**
   * @description Máximo de resultados a serem retornados
   */
  maxResults?: number;

  /**
   * @description Token para a próxima página de resultados
   */
  pageToken?: string;

  /**
   * @description Ordenar resultados por data de início (asc ou desc)
   */
  orderBy?: "startTime" | "viewCount";

  /**
   * @description Incluir detalhes do vídeo na resposta
   */
  includeVideoDetails?: boolean;
}

export interface LiveBroadcastListErrorResponse {
  error: true;
  message: string;
  details?: unknown;
  code?: number;
}

/**
 * @title Listar Transmissões ao Vivo
 * @description Recupera uma lista de transmissões ao vivo para o canal autenticado ou um canal específico
 */
export default async function loader(
  props: ListLiveBroadcastsParams,
  req: Request,
  _ctx: unknown,
): Promise<LiveBroadcastListResponse | LiveBroadcastListErrorResponse> {
  const {
    broadcastId,
    mine = true,
    channelId,
    broadcastStatus = "active",
    maxResults = 25,
    pageToken,
    orderBy = "startTime",
    includeVideoDetails = false,
  } = props;

  const accessToken = props.tokenYoutube || getAccessToken(req);

  if (!accessToken) {
    return {
      error: true,
      message:
        "Autenticação necessária para listar transmissões ao vivo. O token de acesso não foi encontrado.",
    };
  }

  try {
    // Construir a URL manualmente
    const baseUrl = "https://youtube.googleapis.com/youtube/v3/liveBroadcasts";
    const url = new URL(baseUrl);

    // Definir parâmetros comuns
    url.searchParams.append(
      "part",
      includeVideoDetails
        ? "id,snippet,contentDetails,status"
        : "id,snippet,status",
    );
    url.searchParams.append("maxResults", maxResults.toString());

    // Verificar parâmetros mutuamente exclusivos
    if (broadcastId) {
      // Quando ID é especificado, apenas use o ID
      url.searchParams.append("id", broadcastId);

      // Para busca por ID, não use outros filtros
      if (mine || channelId || broadcastStatus !== "all") {
        console.warn(
          "Aviso: Ao buscar por broadcastId específico, outros filtros serão ignorados (mine, channelId, broadcastStatus)",
        );
      }
    } else if (channelId) {
      // Quando channelId é especificado, broadcastStatus é obrigatório
      url.searchParams.append("channelId", channelId);

      if (broadcastStatus === "all") {
        return {
          error: true,
          message:
            "Ao usar channelId, você deve especificar um broadcastStatus diferente de 'all'",
        };
      }

      url.searchParams.append("broadcastStatus", broadcastStatus);

      // Aviso sobre parâmetro mine ignorado
      if (mine) {
        console.warn(
          "Aviso: O parâmetro 'mine' será ignorado porque 'channelId' foi especificado",
        );
      }
    } else {
      // Caso padrão: mine=true
      url.searchParams.append("mine", "true");

      // ATENÇÃO: NÃO adicionar broadcastStatus junto com mine
      // Isso causa o erro: "Incompatible parameters specified in the request: broadcastStatus, mine"

      if (broadcastStatus !== "all") {
        console.warn(
          "Aviso: A API do YouTube não permite usar 'broadcastStatus' junto com 'mine=true'. O parâmetro 'broadcastStatus' será ignorado.",
        );
      }
    }

    // Adicionar parâmetros opcionais
    if (pageToken) {
      url.searchParams.append("pageToken", pageToken);
    }

    if (orderBy) {
      url.searchParams.append("orderBy", orderBy);
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
        `Erro HTTP ${response.status} ao listar transmissões:`,
        errorDetails,
      );

      // Mensagens personalizadas para códigos de erro comuns
      let mensagem =
        `Erro ao listar transmissões: ${response.status} ${response.statusText}`;

      if (response.status === 401) {
        mensagem =
          "Token de autenticação inválido ou expirado. Faça login novamente.";
      } else if (response.status === 403) {
        mensagem =
          "Acesso negado. Verifique se você tem permissão para listar transmissões e o escopo 'youtube.livestream' está autorizado.";
      } else if (response.status === 404) {
        mensagem =
          "Recurso não encontrado. Verifique se os IDs das transmissões estão corretos.";
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
        kind: "youtube#liveBroadcastListResponse",
        etag: "",
        items: [],
        pageInfo: {
          totalResults: 0,
          resultsPerPage: 0,
        },
      };
    }

    // Verificar se foi solicitado um broadcastStatus específico mas não encontrou resultados
    if (data.items.length === 0 && broadcastStatus !== "all") {
      return {
        kind: "youtube#liveBroadcastListResponse",
        etag: data.etag || "",
        items: [],
        pageInfo: data.pageInfo || {
          totalResults: 0,
          resultsPerPage: 0,
        },
        infoMessage:
          `Nenhuma transmissão com status '${broadcastStatus}' encontrada. Tente outro status como 'upcoming' (agendadas), 'active' (ao vivo) ou 'completed' (finalizadas).`,
      };
    }

    return data;
  } catch (error) {
    console.error("Erro ao listar transmissões ao vivo:", error);
    return {
      error: true,
      message: `Erro inesperado ao listar transmissões: ${
        error.message || "Erro desconhecido"
      }`,
      details: error,
    };
  }
}
