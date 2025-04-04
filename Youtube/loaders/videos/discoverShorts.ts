import type { AppContext } from "../../mod.ts";
import getAccessToken from "../../utils/getAccessToken.ts";
import type { YoutubeVideoResponse } from "../../utils/types.ts";
import { getCookies } from "@std/http";
import searchVideos from "./search.ts";

export interface DiscoverShortsOptions {
  /**
   * @description Categoria do vídeo (opcional)
   */
  videoCategoryId?: string;
  /**
   * @description Número máximo de resultados por página
   */
  maxResults?: number;
  /**
   * @description Token para buscar a próxima página
   */
  pageToken?: string;
  /**
   * @description Ordenação dos vídeos (por padrão, é relevance para descoberta)
   */
  order?: "date" | "rating" | "relevance" | "title" | "viewCount";
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
   * @description Definir duração máxima personalizada (padrão é 60 segundos para Shorts)
   */
  maxDuration?: number;
  /**
   * @description Termo de pesquisa adicional (opcional)
   */
  q?: string;
}

/**
 * @title Descobrir Shorts no YouTube
 * @description Descobre vídeos curtos (Shorts) populares ou por categoria no YouTube
 */
export default async function loader(
  props: DiscoverShortsOptions,
  req: Request,
  ctx: AppContext,
): Promise<YoutubeVideoResponse | null> {
  const {
    videoCategoryId,
    maxResults = 20,
    pageToken,
    order = "viewCount", // Por padrão, ordenamos por contagem de visualizações para descoberta
    regionCode = "BR", // Por padrão, usamos Brasil como região
    relevanceLanguage = "pt",
    tokenYoutube,
    maxDuration = 60,
    q = "",
  } = props;

  // Termos de busca específicos para Shorts dependendo da categoria
  let searchQuery = "#shorts";

  if (q) {
    searchQuery = `${q} ${searchQuery}`;
  }

  // Adiciona termos específicos baseados na categoria
  if (videoCategoryId) {
    switch (videoCategoryId) {
      case "1": // Film & Animation
        searchQuery += " filme animação";
        break;
      case "2": // Autos & Vehicles
        searchQuery += " carros veículos";
        break;
      case "10": // Music
        searchQuery += " música";
        break;
      case "15": // Pets & Animals
        searchQuery += " pets animais";
        break;
      case "17": // Sports
        searchQuery += " esportes";
        break;
      case "20": // Gaming
        searchQuery += " gameplay jogo";
        break;
      case "22": // People & Blogs
        searchQuery += " vlog";
        break;
      case "23": // Comedy
        searchQuery += " comédia humor";
        break;
      case "24": // Entertainment
        searchQuery += " entretenimento";
        break;
      case "25": // News & Politics
        searchQuery += " notícias";
        break;
      case "26": // Howto & Style
        searchQuery += " tutorial moda beleza";
        break;
      case "27": // Education
        searchQuery += " educação";
        break;
      case "28": // Science & Technology
        searchQuery += " ciência tecnologia";
        break;
    }
  }

  // Utiliza o loader de busca com parâmetros específicos para Shorts
  return searchVideos(
    {
      q: searchQuery,
      maxResults,
      pageToken,
      order,
      videoCategoryId,
      regionCode,
      relevanceLanguage,
      tokenYoutube,
      onlyShorts: true,
      maxDuration,
    },
    req,
    ctx,
  );
}
