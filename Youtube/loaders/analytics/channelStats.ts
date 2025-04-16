import type { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";

export interface ChannelAnalyticsOptions {
  /**
   * @description ID do canal no formato "channel==CANAL_ID"
   */
  channelId: string;

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
   * Métricas comuns: views, estimatedMinutesWatched, likes, subscribersGained, shares, comments, averageViewDuration
   */
  metrics?: string;

  /**
   * @description Dimensões para agrupar os dados (separadas por vírgula)
   * Dimensões comuns: day, month, video, country, subscribedStatus
   */
  dimensions?: string;

  /**
   * @description Campo para ordenação dos resultados (ex: day, -views para ordem decrescente)
   */
  sort?: string;

  /**
   * @description Filtros adicionais para a consulta
   */
  filters?: string;

  /**
   * @description Número máximo de resultados
   */
  maxResults?: number;

  /**
   * @description Token de acesso do YouTube (opcional)
   */
  tokenYoutube?: string;
}

interface AnalyticsResponse {
  kind: string;
  columnHeaders: Array<{
    name: string;
    columnType: string;
    dataType: string;
  }>;
  rows: Array<Array<string | number>>;
}

/**
 * @title Analytics do Canal do YouTube
 * @description Busca dados analíticos de um canal do YouTube usando a API YouTube Analytics
 */
export default async function loader(
  props: ChannelAnalyticsOptions,
  req: Request,
  _ctx: AppContext,
): Promise<AnalyticsResponse | null> {
  const {
    channelId,
    startDate,
    endDate,
    metrics = "views,estimatedMinutesWatched,subscribersGained",
    dimensions = "day",
    sort = "day",
    filters,
    maxResults,
    tokenYoutube,
  } = props;

  // Obter o token de acesso
  const accessToken = getAccessToken(req) || tokenYoutube;

  if (!accessToken) {
    console.error("Autenticação necessária para obter dados de analytics");
    return null;
  }

  if (!channelId) {
    console.error("ID do canal é obrigatório");
    return null;
  }

  if (!startDate || !endDate) {
    console.error("Datas de início e término são obrigatórias");
    return null;
  }

  // Validar formato das datas (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    console.error("Datas devem estar no formato YYYY-MM-DD");
    return null;
  }

  try {
    // Construir URL da requisição com os parâmetros
    let url = "https://youtubeanalytics.googleapis.com/v2/reports";

    // Adicionar parâmetros obrigatórios
    const params = new URLSearchParams({
      ids: channelId,
      startDate,
      endDate,
      metrics,
      dimensions,
      sort,
    });

    // Adicionar parâmetros opcionais se fornecidos
    if (filters) params.append("filters", filters);
    if (maxResults) params.append("maxResults", maxResults.toString());

    url += `?${params.toString()}`;

    // Fazer a requisição para a API do YouTube Analytics
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(
        `Erro ao buscar dados de analytics: ${response.status} ${response.statusText}`,
        errorData,
      );
      return null;
    }

    // Processar e retornar os dados
    const analyticsData = await response.json();

    // Formatação dos dados para facilitar o uso
    const formattedResponse = {
      kind: analyticsData.kind,
      columnHeaders: analyticsData.columnHeaders,
      rows: analyticsData.rows || [],
    };

    return formattedResponse;
  } catch (error) {
    console.error("Erro ao buscar dados de analytics:", error);
    return null;
  }
}
