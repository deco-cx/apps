import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import { AppContext } from "../../mod.ts";

/**
 * Resultado da atualização de categoria de vídeo
 */
export interface UpdateCategoryResult {
  success: boolean;
  video: unknown;
}

export interface UpdateCategoryError {
  message: string;
  error: boolean;
  code?: number;
  details?: unknown;
}

export type UpdateCategoryResponse = UpdateCategoryResult | UpdateCategoryError;

/**
 * Opções para atualização de categoria de vídeo
 */
export interface UpdateCategoryOptions {
  /**
   * @description ID do vídeo a ser atualizado
   */
  videoId: string;

  /**
   * @description ID da categoria do vídeo
   * Categorias comuns:
   * 1 - Filmes e animação
   * 2 - Automóveis
   * 10 - Música
   * 15 - Animais
   * 17 - Esportes
   * 18 - Curtas-metragens
   * 19 - Viagens e eventos
   * 20 - Jogos
   * 22 - Pessoas e blogs
   * 23 - Comédia
   * 24 - Entretenimento
   * 25 - Notícias e política
   * 26 - Guias e estilo
   * 27 - Educação
   * 28 - Ciência e tecnologia
   * 29 - Sem fins lucrativos/ativismo
   */
  categoryId: string;
}

/**
 * @title Update Video Category
 * @description Updates the category of a YouTube video
 */
export default async function action(
  props: UpdateCategoryOptions,
  req: Request,
  ctx: AppContext,
): Promise<UpdateCategoryResponse> {
  const client = ctx.client;

  if (!props.videoId) {
    return createErrorResponse(400, "ID do vídeo é obrigatório");
  }

  if (!props.categoryId) {
    return createErrorResponse(400, "ID da categoria é obrigatório");
  }

  try {
    // Primeiro, obter os dados atuais do vídeo para não perder informações
    const getResponse = await client["GET /videos"]({
      part: "snippet,status",
      id: props.videoId,
    });

    if (!getResponse.ok) {
      return createErrorResponse(
        getResponse.status,
        `Erro ao obter dados do vídeo: ${getResponse.status}`,
        await getResponse.text(),
      );
    }

    const videoData = await getResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      return createErrorResponse(404, "Vídeo não encontrado");
    }

    // Obter o snippet atual para fazer atualizações parciais
    const currentVideo = videoData.items[0];
    const snippet = { ...currentVideo.snippet };

    // Atualizar a categoria
    snippet.categoryId = props.categoryId;

    // Montar o corpo da requisição
    const requestBody = {
      id: props.videoId,
      snippet,
    };

    // Enviar a requisição de atualização
    const updateResponse = await client["PUT /videos"](
      { part: "snippet" },
      {
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      },
    );

    if (!updateResponse.ok) {
      return createErrorResponse(
        updateResponse.status,
        `Erro ao atualizar categoria do vídeo: ${updateResponse.status}`,
        await updateResponse.text(),
      );
    }

    const updatedVideoData = await updateResponse.json();

    return {
      success: true,
      video: updatedVideoData,
    };
  } catch (error) {
    return createErrorResponse(
      500,
      "Erro ao processar atualização de categoria",
      error instanceof Error ? error.message : String(error),
    );
  }
}

/**
 * Função auxiliar para criar respostas de erro
 */
function createErrorResponse(
  code: number,
  message: string,
  details?: unknown,
): UpdateCategoryError {
  return {
    message,
    error: true,
    code,
    details,
  };
}
