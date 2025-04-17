import { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import { STALE } from "../../../utils/fetch.ts";

export interface VideoCategoriesOptions {
  /**
   * @description Código de região (padrão: BR)
   */
  regionCode?: string;

  /**
   * @description Token de acesso do YouTube (opcional)
   */
  tokenYoutube?: string;
  
  /**
   * @description Ignorar cache para esta solicitação
   */
  skipCache?: boolean;
}

interface VideoCategory {
  id: string;
  snippet: {
    title: string;
    assignable: boolean;
    channelId: string;
  };
}

interface VideoCategoriesResponse {
  kind: string;
  etag: string;
  items: VideoCategory[];
  error?: {
    code: number;
    message: string;
    details?: unknown;
  };
}

/**
 * @title List Video Categories
 * @description Obtém a lista de categorias de vídeos disponíveis no YouTube para uma região específica
 */
export default async function loader(
  props: VideoCategoriesOptions,
  req: Request,
  _ctx: AppContext,
): Promise<VideoCategoriesResponse | null> {
  const { regionCode = "BR", tokenYoutube, skipCache = false } = props;

  // Obter o token de acesso
  const accessToken = getAccessToken(req) || tokenYoutube;

  if (!accessToken) {
    return {
      kind: "youtube#videoCategoryListResponse",
      etag: "",
      items: [],
      error: {
        code: 401,
        message: "Autenticação necessária para obter categorias de vídeos"
      }
    };
  }

  try {
    // Construir a URL para buscar as categorias de vídeos
    const url = new URL("https://www.googleapis.com/youtube/v3/videoCategories");
    url.searchParams.append("part", "snippet");
    url.searchParams.append("regionCode", regionCode);

    // Opções de fetch compatíveis com STALE
    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      ...STALE
    };

    // Buscar as categorias
    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => response.text());
      return {
        kind: "youtube#videoCategoryListResponse",
        etag: "",
        items: [],
        error: {
          code: response.status,
          message: `Erro ao buscar categorias de vídeos: ${response.status} ${response.statusText}`,
          details: errorData
        }
      };
    }

    // Retornar os dados das categorias
    const categoriesData = await response.json();

    // Ordenar categorias por ID numérico
    if (categoriesData.items) {
      categoriesData.items.sort((a: VideoCategory, b: VideoCategory) =>
        parseInt(a.id, 10) - parseInt(b.id, 10)
      );
    }

    return categoriesData;
  } catch (error) {
    return {
      kind: "youtube#videoCategoryListResponse",
      etag: "",
      items: [],
      error: {
        code: 500,
        message: "Erro ao buscar categorias de vídeos",
        details: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

// Define a estratégia de cache como stale-while-revalidate
export const cache = "stale-while-revalidate";

// Define a chave de cache com base nos parâmetros da requisição
export const cacheKey = (props: VideoCategoriesOptions, req: Request, _ctx: AppContext) => {
  const accessToken = getAccessToken(req) || props.tokenYoutube;
  
  // Não usar cache se não houver token ou se skipCache for verdadeiro
  if (!accessToken || props.skipCache) {
    return null;
  }
  
  const params = new URLSearchParams([
    ["regionCode", props.regionCode || "BR"],
  ]);
  
  // Ordenamos os parâmetros para garantir consistência na chave de cache
  params.sort();
  
  return `youtube-video-categories-${params.toString()}`;
};
