import type { AppContext } from "../../mod.ts";
import getAccessToken from "../../utils/getAccessToken.ts";

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
}

interface AnalyticsResponse {
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
    metrics = "views,estimatedMinutesWatched,likes,comments,shares,averageViewDuration",
    dimensions = "video",
    sort = "-views",
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
    
    // Adicionar filtro de vídeo específico se for fornecido
    if (videoId) params.append("filters", `video==${videoId}`);
    
    // Adicionar limite de resultados se fornecido
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
      console.error(`Erro ao buscar dados de analytics: ${response.status} ${response.statusText}`, errorData);
      return null;
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
        const videoObject: any = {
          videoId: row[headerIndexMap["video"]],
          metrics: {},
        };
        
        // Adicionar cada métrica ao objeto do vídeo
        for (const header of formattedResponse.columnHeaders) {
          if (header.name !== "video") {
            videoObject.metrics[header.name] = row[headerIndexMap[header.name]];
          }
        }
        
        videoData.push(videoObject);
      }
      
      formattedResponse.videoData = videoData;
    }
    
    return formattedResponse;
  } catch (error) {
    console.error("Erro ao buscar dados de analytics para vídeos:", error);
    return null;
  }
} 