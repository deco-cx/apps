import type { AppContext } from "../mod.ts";
import { getAccessToken } from "../utils/cookieAccessToken.ts";

export interface VideoCategoriesOptions {
  /**
   * @description Código de região (padrão: BR)
   */
  regionCode?: string;

  /**
   * @description Token de acesso do YouTube (opcional)
   */
  tokenYoutube?: string;
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
}

/**
 * @title List Video Categories
 * @description Gets the list of video categories available on YouTube for a specific region
 */
export default async function loader(
  props: VideoCategoriesOptions,
  req: Request,
  _ctx: AppContext,
): Promise<VideoCategoriesResponse | null> {
  const { regionCode = "BR", tokenYoutube } = props;

  // Obter o token de acesso
  const accessToken = getAccessToken(req) || tokenYoutube;

  if (!accessToken) {
    console.error("Autenticação necessária para obter categorias de vídeos");
    return null;
  }

  try {
    // Construir a URL para buscar as categorias de vídeos
    const url =
      `https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=${regionCode}`;

    // Buscar as categorias
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(
        `Erro ao buscar categorias de vídeos: ${response.status} ${response.statusText}`,
        errorData,
      );
      return null;
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
    console.error("Erro ao buscar categorias de vídeos:", error);
    return null;
  }
}
