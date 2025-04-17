import { AppContext } from "../../../Youtube/mod.ts";
import { getAccessToken } from "../../../Youtube/utils/cookieAccessToken.ts";
import { STALE } from "../../../utils/fetch.ts";

export interface VideoAnalyticsOptions {
  /**
   * @description ID do canal no formato "channel==CANAL_ID"
   */
  channelId: string;

  /**
   * @description ID do vídeo ou IDs de vídeos separados por vírgula para filtrar (opcional)
   */
  videoId?: string;

  /**
   * @description Data de início da consulta (formato: YYYY-MM-DD)
   */
  startDate: string;

  /**
   * @description Data de término da consulta (formato: YYYY-MM-DD)
   */
  endDate: string;

  /**
   * @description Métricas a serem buscadas (separadas por vírgula)
   * Métricas comuns para vídeos: views, estimatedMinutesWatched, averageViewDuration, averageViewPercentage, likes, comments, shares
   */
  metrics?: string;

  /**
   * @description Dimensões para agrupar os dados (separadas por vírgula)
   * Para vídeos específicos, use "video" para separar por vídeo
   */
  dimensions?: string;

  /**
   * @description Campo para ordenação dos resultados (ex: -views para classificar por mais visualizações)
   */
  sort?: string;

  /**
   * @description Número máximo de resultados
   */
  maxResults?: number;

  /**
   * @description Token de acesso do YouTube (opcional)
   */
  tokenYoutube?: string;
  
  /**
   * @description Ignorar cache para esta solicitação
   */
  skipCache?: boolean;
}

export interface AnalyticsResponse {
  kind: string;
  columnHeaders: Array<{
    name: string;
    columnType: string;
    dataType: string;
  }>;
  rows: Array<Array<string | number>>;
  videoData?: Array<{
    videoId: string;
    title?: string;
    metrics: Record<string, number>;
  }>;
  error?: {
    code: number;
    message: string;
    details?: unknown;
  };
}

/**
 * @title Analytics de Vídeos do YouTube
 * @description Busca dados analíticos de vídeos específicos usando a API YouTube Analytics
 */
export default async function loader(
  props: VideoAnalyticsOptions,
  req: Request,
  _ctx: AppContext,
): Promise<AnalyticsResponse | null> {
  const {
    channelId,
    videoId,
    startDate,
    endDate,
    metrics =
      "views,estimatedMinutesWatched,likes,comments,shares,averageViewDuration",
    dimensions = "video",
    sort = "-views",
    maxResults,
    tokenYoutube,
    skipCache = false
  } = props;

  // Obter o token de acesso
  const accessToken = getAccessToken(req) || tokenYoutube;

  if (!accessToken) {
    return createErrorResponse(401, "Autenticação necessária para obter dados de analytics");
  }

  if (!channelId) {
    return createErrorResponse(400, "ID do canal é obrigatório");
  }

  if (!startDate || !endDate) {
    return createErrorResponse(400, "Datas de início e término são obrigatórias");
  }

  // Validar formato das datas (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return createErrorResponse(400, "Datas devem estar no formato YYYY-MM-DD");
  }

  try {
    // Construir URL da requisição com os parâmetros
    const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");

    // Adicionar parâmetros obrigatórios
    const params = new URLSearchParams({
      ids: channelId,
      startDate,
      endDate,
      metrics,
      dimensions,
      sort,
    });

    // Adicionar filtro de vídeo específico se for fornecido
    if (videoId) params.append("filters", `video==${videoId}`);

    // Adicionar limite de resultados se fornecido
    if (maxResults) params.append("maxResults", maxResults.toString());

    url.search = params.toString();

    // Fazer a requisição para a API do YouTube Analytics
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      ...STALE
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => response.text());
      return createErrorResponse(
        response.status,
        `Erro ao buscar dados de analytics: ${response.status} ${response.statusText}`,
        errorData
      );
    }

    // Processar e retornar os dados
    const analyticsData = await response.json();

    // Formatação dos dados para facilitar o uso
    const formattedResponse: AnalyticsResponse = {
      kind: analyticsData.kind,
      columnHeaders: analyticsData.columnHeaders || [],
      rows: analyticsData.rows || [],
    };

    // Estrutura os dados de uma forma mais fácil de usar quando a dimensão é "video"
    if (dimensions.includes("video") && formattedResponse.rows.length > 0) {
      const videoData = [];
      const headerIndexMap: Record<string, number> = {};

      // Mapear índices das colunas
      formattedResponse.columnHeaders.forEach((header, index) => {
        headerIndexMap[header.name] = index;
      });

      // Criar objetos estruturados para cada vídeo
      for (const row of formattedResponse.rows) {
        const videoObject: {
          videoId: string | number;
          metrics: Record<string, number>;
        } = {
          videoId: row[headerIndexMap["video"]],
          metrics: {},
        };

        // Adicionar cada métrica ao objeto do vídeo
        for (const header of formattedResponse.columnHeaders) {
          if (header.name !== "video") {
            videoObject.metrics[header.name] = row[headerIndexMap[header.name]] as number;
          }
        }

        videoData.push(videoObject);
      }

      formattedResponse.videoData = videoData;
    }

    return formattedResponse;
  } catch (error) {
    return createErrorResponse(
      500,
      "Erro ao buscar dados de analytics para vídeos",
      error instanceof Error ? error.message : String(error)
    );
  }
}

// Função auxiliar para criar respostas de erro
function createErrorResponse(code: number, message: string, details?: unknown): AnalyticsResponse {
  return {
    kind: "youtube#analyticData",
    columnHeaders: [],
    rows: [],
    error: {
      code,
      message,
      details
    }
  };
}

// Define a estratégia de cache como stale-while-revalidate
export const cache = "stale-while-revalidate";

// Define a chave de cache com base nos parâmetros da requisição
export const cacheKey = (props: VideoAnalyticsOptions, req: Request, _ctx: AppContext) => {
  const accessToken = getAccessToken(req) || props.tokenYoutube;
  
  // Não usar cache se não houver token ou se skipCache for verdadeiro
  if (!accessToken || props.skipCache) {
    return null;
  }
  
  const params = new URLSearchParams([
    ["channelId", props.channelId],
    ["videoId", props.videoId || ""],
    ["startDate", props.startDate],
    ["endDate", props.endDate],
    ["metrics", props.metrics || "views,estimatedMinutesWatched,likes,comments,shares,averageViewDuration"],
    ["dimensions", props.dimensions || "video"],
    ["sort", props.sort || "-views"],
    ["maxResults", props.maxResults?.toString() || ""],
  ]);
  
  // Ordenamos os parâmetros para garantir consistência na chave de cache
  params.sort();
  
  return `youtube-analytics-video-${params.toString()}`;
};
