import type { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import type { YouTubeCaptionListResponse } from "../../utils/types.ts";

export interface VideoCaptionsOptions {
  /**
   * @description ID do vídeo para buscar legendas
   */
  videoId: string;
  /**
   * @description Token de acesso do YouTube (opcional)
   */
  tokenYoutube?: string;
}

/**
 * @title Legendas de Vídeo do YouTube
 * @description Busca as legendas disponíveis para um vídeo específico.
 * Para obter o texto completo de uma legenda específica, use o ID retornado
 * nesta resposta com o loader `captionText.ts` passando o `captionId`.
 */
export default async function loader(
  props: VideoCaptionsOptions,
  req: Request,
  ctx: AppContext,
): Promise<YouTubeCaptionListResponse | null> {
  const client = ctx.client;
  const accessToken = getAccessToken(req) || props.tokenYoutube;

  if (!accessToken) {
    console.error("Autenticação necessária para obter legendas do vídeo");
    return null;
  }

  const { videoId } = props;

  if (!videoId) {
    console.error("ID do vídeo é obrigatório");
    return null;
  }

  try {
    // Busca a lista de legendas disponíveis para o vídeo
    const captionsData = await client["GET /captions"]({
      part: "snippet",
      videoId,
    }, { headers: { Authorization: `Bearer ${accessToken}` } }).then((res) =>
      res.json()
    );

    if (!captionsData.items || captionsData.items.length === 0) {
      return {
        kind: "youtube#captionListResponse",
        etag: "",
        items: [],
      };
    }

    return captionsData;
  } catch (error) {
    console.error(`Erro ao buscar legendas para o vídeo ${videoId}:`, error);
    return {
      kind: "youtube#captionListResponse",
      etag: "",
      items: [],
    };
  }
}
