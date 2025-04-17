import type { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import type { VideoQuery, YoutubeVideoResponse, YoutubeVideoItem } from "../../utils/types.ts";
import { STALE } from "../../../utils/fetch.ts";

export interface VideoSearchOptions {
  /**
   * @description Termo de busca para pesquisar vídeos
   */
  q: string;
  /**
   * @description Número máximo de resultados por página
   */
  maxResults?: number;
  /**
   * @description Token para buscar a próxima página
   */
  pageToken?: string;
  /**
   * @description Ordenação dos vídeos
   */
  order?: "date" | "rating" | "relevance" | "title" | "viewCount";
  /**
   * @description ID do canal para filtrar resultados (opcional)
   */
  channelId?: string;
  /**
   * @description Data de publicação mínima (formato ISO 8601)
   */
  publishedAfter?: string;
  /**
   * @description Data de publicação máxima (formato ISO 8601)
   */
  publishedBefore?: string;
  /**
   * @description Categoria do vídeo
   */
  videoCategoryId?: string;
  /**
   * @description Região para pesquisa (código de país ISO 3166-1 alpha-2)
   */
  regionCode?: string;
  /**
   * @description Código de idioma (ISO 639-1)
   */
  relevanceLanguage?: string;
  /**
   * @description Token de autenticação do YouTube (opcional)
   */
  tokenYoutube?: string;
  /**
   * @description Buscar também vídeos privados (quando autenticado)
   */
  includePrivate?: boolean;
  /**
   * @description Filtrar apenas Shorts (vídeos verticais curtos)
   */
  onlyShorts?: boolean;
  /**
   * @description Excluir Shorts dos resultados
   */
  excludeShorts?: boolean;
  /**
   * @description Duração máxima dos vídeos em segundos (útil para Shorts)
   */
  maxDuration?: number;
  skipCache?: boolean;
}

interface SearchResponseItem {
  id: {
    videoId: string;
  };
}

interface VideoWithDuration extends YoutubeVideoItem {
  isShort: boolean;
  durationInSeconds: number;
}

/**
 * @title Search YouTube Videos
 * @description Searches YouTube videos with various filtering criteria, with or without authentication, including filters for Shorts
 */
export default async function loader(
  props: VideoSearchOptions,
  req: Request,
  ctx: AppContext,
): Promise<YoutubeVideoResponse | null> {
  const client = ctx.client;

  const accessToken = props.tokenYoutube || getAccessToken(req);

  const {
    q,
    maxResults = 10,
    pageToken,
    order = "relevance",
    channelId,
    publishedAfter,
    publishedBefore,
    videoCategoryId,
    regionCode,
    relevanceLanguage,
    includePrivate = false,
    onlyShorts = false,
    excludeShorts = false,
    maxDuration,
  } = props;

  if (!q) {
    console.error("Nenhum termo de busca fornecido");
    return null;
  }

  // Validação para evitar configurações conflitantes
  if (onlyShorts && excludeShorts) {
    console.error(
      "Configuração inválida: não é possível definir onlyShorts e excludeShorts simultaneamente",
    );
    return null;
  }

  const searchParams: VideoQuery = {
    part: "snippet",
    q,
    maxResults: onlyShorts ? Math.max(maxResults * 2, 50) : maxResults, // Busca mais resultados quando filtrando shorts
    order,
    type: "video",
  };

  if (pageToken) searchParams.pageToken = pageToken;
  if (channelId) searchParams.channelId = channelId;
  if (publishedAfter) searchParams.publishedAfter = publishedAfter;
  if (publishedBefore) searchParams.publishedBefore = publishedBefore;
  if (videoCategoryId) searchParams.videoCategoryId = videoCategoryId;
  if (regionCode) searchParams.regionCode = regionCode;
  if (relevanceLanguage) searchParams.relevanceLanguage = relevanceLanguage;

  // Aplicar videoDuration=short na busca quando filtrando por Shorts
  if (onlyShorts) {
    searchParams.videoDuration = "short"; // Vídeos curtos (< 4 minutos)
  }

  // Se tem token de acesso e quer incluir vídeos privados
  if (accessToken && includePrivate) {
    searchParams.forMine = true;
  }

  try {
    const requestOptions = accessToken
      ? { 
          headers: { Authorization: `Bearer ${accessToken}` },
          ...STALE
        }
      : { ...STALE };

    if (onlyShorts) console.log("Filtrando apenas por Shorts");
    if (excludeShorts) console.log("Excluindo Shorts dos resultados");

    const searchData = await client["GET /search"](
      searchParams,
      requestOptions,
    ).then((res: Response) => {
      // Verificar erro de autenticação
      if (res.status === 401) {
        // Sinalizar que o token está expirado
        ctx.response.headers.set("X-Token-Expired", "true");
        ctx.response.headers.set("Cache-Control", "no-store");
        throw new Error("Token de autenticação expirado ou inválido");
      }
      return res;
    }).then((res: Response) => res.json());

    if (!searchData.items || searchData.items.length === 0) {
      console.log("Nenhum resultado encontrado para a busca");
      return {
        kind: "youtube#videoListResponse",
        items: [],
        pageInfo: searchData.pageInfo || { totalResults: 0, resultsPerPage: 0 },
        regionCode: searchData.regionCode,
      };
    }

    const videoIds = (searchData.items as SearchResponseItem[]).map((item) => item.id.videoId)
      .join(",");

    const detailsOptions = accessToken
      ? { 
          headers: { Authorization: `Bearer ${accessToken}` },
          ...STALE
        }
      : { ...STALE };

    // Para identificar Shorts corretamente, precisamos das dimensões e duração do vídeo
    const detailsParams = {
      part: "snippet,statistics,status,contentDetails",
      id: videoIds,
    };

    const detailsData = await client["GET /videos"](
      detailsParams,
      detailsOptions,
    ).then((res: Response) => res.json());

    let items = detailsData.items || [];

    // Processa itens para identificar e filtrar Shorts
    if (items.length > 0) {
      // Marca os itens que são Shorts baseado na duração e dimensões do vídeo
      items = items.map((item: YoutubeVideoItem) => {
        // Extrai a duração em segundos do formato ISO 8601 (PT1M30S)
        const duration = item.contentDetails?.duration || "PT0S";
        const durationInSeconds = calculateDurationInSeconds(duration);

        // Um vídeo é considerado Short se tiver menos de 60 segundos
        const isShort = durationInSeconds <= 60;

        // Adiciona informação se é Short
        return {
          ...item,
          isShort,
          durationInSeconds,
        };
      });

      // Filtrar apenas Shorts
      if (onlyShorts) {
        items = items.filter((item: VideoWithDuration) => item.isShort);
        items = items.slice(0, maxResults); // Limita ao número original solicitado
      }

      // Excluir Shorts dos resultados
      if (excludeShorts) {
        items = items.filter((item: VideoWithDuration) => !item.isShort);
      }

      // Filtrar por duração máxima
      if (maxDuration) {
        items = items.filter((item: VideoWithDuration) => item.durationInSeconds <= maxDuration);
      }
    }

    const response: YoutubeVideoResponse = {
      kind: "youtube#videoListResponse",
      items,
      nextPageToken: searchData.nextPageToken,
      prevPageToken: searchData.prevPageToken,
      pageInfo: {
        totalResults: items.length,
        resultsPerPage: items.length,
      },
      regionCode: searchData.regionCode,
      isAuthenticated: !!accessToken,
    };

    return response;
  } catch (error) {
    console.error("Erro ao buscar vídeos:", error);
    return null;
  }
}

/**
 * Converte uma duração ISO 8601 (PT1M30S) para segundos
 */
function calculateDurationInSeconds(isoDuration: string): number {
  // Remove o prefixo PT
  const duration = isoDuration.substring(2);

  let seconds = 0;
  let minutes = 0;
  let hours = 0;

  // Extrai horas, minutos e segundos
  const hoursMatch = duration.match(/(\d+)H/);
  if (hoursMatch) {
    hours = parseInt(hoursMatch[1], 10);
  }

  const minutesMatch = duration.match(/(\d+)M/);
  if (minutesMatch) {
    minutes = parseInt(minutesMatch[1], 10);
  }

  const secondsMatch = duration.match(/(\d+)S/);
  if (secondsMatch) {
    seconds = parseInt(secondsMatch[1], 10);
  }

  return hours * 3600 + minutes * 60 + seconds;
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: VideoSearchOptions, req: Request, ctx: AppContext) => {
  // Verificar se há flag de token expirado
  const tokenExpired = req.headers.get("X-Token-Expired") === "true";

  // Não usar cache para buscas que dependem da autenticação do usuário ou quando o token expirou
  if (props.includePrivate || props.skipCache || tokenExpired) {
    return null;
  }
  
  // Incluir fragmento do token na chave de cache, se disponível
  const accessToken = getAccessToken(req) || props.tokenYoutube;
  const tokenFragment = accessToken ? accessToken.slice(-8) : "";
  
  // Cria parâmetros para a chave de cache
  const params = new URLSearchParams([
    ["q", props.q || ""],
    ["maxResults", (props.maxResults || 10).toString()],
    ["pageToken", props.pageToken || ""],
    ["order", props.order || "relevance"],
    ["channelId", props.channelId || ""],
    ["publishedAfter", props.publishedAfter || ""],
    ["publishedBefore", props.publishedBefore || ""],
    ["videoCategoryId", props.videoCategoryId || ""],
    ["regionCode", props.regionCode || ""],
    ["relevanceLanguage", props.relevanceLanguage || ""],
    ["onlyShorts", (props.onlyShorts || false).toString()],
    ["excludeShorts", (props.excludeShorts || false).toString()],
    ["maxDuration", props.maxDuration?.toString() || ""],
    ["tokenId", tokenFragment],
  ]);
  
  // Ordenamos os parâmetros para garantir consistência na chave de cache
  params.sort();
  
  return `youtube-search-${params.toString()}`;
};
