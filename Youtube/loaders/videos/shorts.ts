import type { AppContext } from "../../mod.ts";
import getAccessToken from "../../utils/getAccessToken.ts";
import type { YoutubeVideoResponse } from "../../utils/types.ts";
import { getCookies } from "@std/http";
import searchVideos from "./search.ts";

export interface ShortsSearchOptions {
  /**
   * @description Termo de busca para pesquisar Shorts
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
   * @description Token de autenticação do YouTube (opcional)
   */
  tokenYoutube?: string;
  /**
   * @description Definir duração máxima personalizada (padrão é 60 segundos para Shorts)
   */
  maxDuration?: number;
  /**
   * @description Data de publicação mínima (formato ISO 8601)
   */
  publishedAfter?: string;
  /**
   * @description Data de publicação máxima (formato ISO 8601)
   */
  publishedBefore?: string;
}

/**
 * @title Pesquisar Shorts no YouTube
 * @description Busca vídeos curtos (Shorts) no YouTube com filtros específicos
 */
export default async function loader(
  props: ShortsSearchOptions,
  req: Request,
  ctx: AppContext,
): Promise<YoutubeVideoResponse | null> {
  const {
    q,
    maxResults = 10,
    pageToken,
    order = "relevance",
    channelId,
    tokenYoutube,
    maxDuration = 60,
    publishedAfter,
    publishedBefore,
  } = props;

  // Utiliza o loader de busca com parâmetros específicos para Shorts
  return searchVideos(
    {
      q,
      maxResults,
      pageToken,
      order,
      channelId,
      tokenYoutube,
      onlyShorts: true,
      maxDuration,
      publishedAfter,
      publishedBefore,
    },
    req,
    ctx,
  );
}
