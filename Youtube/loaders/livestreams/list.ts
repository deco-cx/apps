import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import { AppContext } from "../../mod.ts";

/**
 * Opções para listar transmissões ao vivo
 */
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

export interface LiveBroadcastListResult {
  kind: string;
  etag: string;
  items: Array<unknown>;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  nextPageToken?: string;
  prevPageToken?: string;
}

export interface LiveBroadcastListError {
  message: string;
  error: boolean;
  code?: number;
  details?: unknown;
}

export type LiveBroadcastListResponse =
  | LiveBroadcastListResult
  | LiveBroadcastListError;

/**
 * @title List Live Broadcasts
 * @description Retrieves a list of live broadcasts for the authenticated channel or a specific channel
 */
export default async function loader(
  props: ListLiveBroadcastsParams,
  req: Request,
  ctx: AppContext,
): Promise<LiveBroadcastListResponse> {
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
    return createErrorResponse(
      401,
      "Autenticação necessária para listar transmissões ao vivo. O token de acesso não foi encontrado.",
    );
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
        return createErrorResponse(
          400,
          "Ao usar channelId, você deve especificar um broadcastStatus diferente de 'all'",
        );
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

      // Códigos de erro mais comuns
      if (response.status === 401) {
        return createErrorResponse(
          401,
          "Token de autenticação inválido ou expirado. Faça login novamente.",
          errorDetails,
        );
      } else if (response.status === 403) {
        return createErrorResponse(
          403,
          "Acesso negado. Verifique se você tem permissão para listar transmissões.",
          errorDetails,
        );
      } else if (response.status === 404) {
        return createErrorResponse(
          404,
          "Recurso não encontrado. Verifique se os IDs das transmissões estão corretos.",
          errorDetails,
        );
      } else if (response.status === 400) {
        return createErrorResponse(
          400,
          "Solicitação inválida. Verifique os parâmetros enviados.",
          errorDetails,
        );
      } else if (response.status === 429) {
        return createErrorResponse(
          429,
          "Limite de requisições excedido. Aguarde um momento e tente novamente.",
          errorDetails,
        );
      }

      return createErrorResponse(
        response.status,
        `Erro ao listar transmissões: ${response.status} ${response.statusText}`,
        errorDetails,
      );
    }

    const data = await response.json();

    // Verificar erros no formato de resposta da API
    if (data.error) {
      return createErrorResponse(
        data.error.code || 500,
        `Erro na API do YouTube: ${data.error.message || "erro desconhecido"}`,
        data.error,
      );
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

    // Retornar os dados processados
    return data;
  } catch (error) {
    return createErrorResponse(
      500,
      "Erro ao processar listagem de transmissões",
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
): LiveBroadcastListError {
  return {
    message,
    error: true,
    code,
    details,
  };
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: ListLiveBroadcastsParams, req: Request) => {
  const accessToken = getAccessToken(req) || props.tokenYoutube;

  // Não usar cache para consultas que exigem dados em tempo real
  if (!accessToken || props.broadcastStatus === "active") {
    return null;
  }

  // Incluir fragmento do token na chave de cache
  const tokenFragment = accessToken.slice(-8);

  const params = new URLSearchParams([
    ["broadcastId", props.broadcastId || ""],
    ["channelId", props.channelId || ""],
    ["mine", (props.mine === true).toString()],
    ["broadcastStatus", props.broadcastStatus || "active"],
    ["maxResults", props.maxResults?.toString() || "25"],
    ["pageToken", props.pageToken || ""],
    ["orderBy", props.orderBy || "startTime"],
    ["includeVideoDetails", (props.includeVideoDetails === true).toString()],
    ["tokenId", tokenFragment],
  ]);

  params.sort();

  return `youtube-livestreams-list-${params.toString()}`;
};
