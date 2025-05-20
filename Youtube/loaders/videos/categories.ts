import { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import { STALE } from "../../../utils/fetch.ts";
import { YoutubeCategoryListResponse } from "../../utils/types.ts";

export interface VideoCategoriesOptions {
  /**
   * @description Código de região (padrão: BR)
   */
  regionCode?: string;

  /**
   * @description Ignorar cache para esta solicitação
   */
  skipCache?: boolean;
}

/**
 * @title List Video Categories
 * @description Obtém a lista de categorias de vídeos disponíveis no YouTube para uma região específica
 */
export default async function loader(
  props: VideoCategoriesOptions,
  req: Request,
  ctx: AppContext,
): Promise<YoutubeCategoryListResponse | null> {
  const { regionCode = "BR" } = props;
  const client = ctx.client;

  try {
    const response = await client["GET /videoCategories"]({
      part: "snippet",
      regionCode,
    }, {
      ...STALE,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => response.text());

      if (response.status === 401) {
        ctx.response.headers.set("X-Token-Expired", "true");

        ctx.response.headers.set("Cache-Control", "no-store");
      }

      return createErrorResponse(
        response.status,
        `Erro ao buscar categorias de vídeos: ${response.status} ${response.statusText}`,
        errorData,
      );
    }

    const categoriesData = await response.json() as YoutubeCategoryListResponse;

    if (categoriesData.items) {
      categoriesData.items.sort((a, b) =>
        parseInt(a.id, 10) - parseInt(b.id, 10)
      );
    }

    return categoriesData;
  } catch (error) {
    return createErrorResponse(
      500,
      "Erro ao buscar categorias de vídeos",
      error instanceof Error ? error.message : String(error),
    );
  }
}

function createErrorResponse(
  code: number,
  message: string,
  details?: unknown,
): YoutubeCategoryListResponse {
  return {
    kind: "youtube#videoCategoryListResponse",
    etag: "",
    items: [],
    error: {
      code,
      message,
      details,
    },
  };
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: VideoCategoriesOptions, req: Request) => {
  const tokenExpired = req.headers.get("X-Token-Expired") === "true";

  if (props.skipCache || tokenExpired) {
    return null;
  }

  const params = new URLSearchParams([
    ["regionCode", props.regionCode || "BR"],
  ]);

  params.sort();

  return `youtube-video-categories-${params.toString()}`;
};
