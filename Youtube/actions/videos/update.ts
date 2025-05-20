import { AppContext } from "../../mod.ts";

/**
 * Opções para atualização de vídeo
 */
export interface UpdateVideoOptions {
  /**
   * @description ID do vídeo a ser atualizado
   */
  videoId: string;

  /**
   * @description Novo título do vídeo (opcional)
   */
  title?: string;

  /**
   * @description Nova descrição do vídeo (opcional)
   */
  description?: string;

  /**
   * @description Novas tags do vídeo (opcional)
   */
  tags?: string[] | undefined;

  /**
   * @description Novo status de privacidade do vídeo (opcional)
   */
  privacyStatus?: "public" | "private" | "unlisted";
}

export interface UpdateVideoResult {
  success: boolean;
  video: unknown;
}

export interface UpdateVideoError {
  message: string;
  error: boolean;
  code?: number;
  details?: unknown;
}

export type UpdateVideoResponse = UpdateVideoResult | UpdateVideoError;

/**
 * @title Update YouTube Video
 * @description Updates video information like title, description, tags and privacy status
 */
export default async function action(
  props: UpdateVideoOptions,
  req: Request,
  ctx: AppContext,
): Promise<UpdateVideoResponse> {
  const client = ctx.client;

  if (!props.videoId) {
    return createErrorResponse(400, "ID do vídeo é obrigatório");
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
    const status = { ...currentVideo.status };

    // Atualizar apenas os campos fornecidos
    if (props.title !== undefined) snippet.title = props.title;
    if (props.description !== undefined) {
      snippet.description = props.description;
    }
    if (props.tags !== undefined) {
      snippet.tags = Array.isArray(props.tags) ? props.tags : [props.tags];
    }
    if (props.privacyStatus !== undefined) {
      status.privacyStatus = props.privacyStatus;
    }

    // Montar o corpo da requisição
    const requestBody = {
      id: props.videoId,
      snippet,
      status,
    };

    // Enviar a requisição de atualização usando o client
    const updateResponse = await client["PUT /videos"](
      { part: "snippet,status" },
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
        `Erro ao atualizar vídeo: ${updateResponse.status}`,
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
      "Erro ao processar atualização do vídeo",
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
): UpdateVideoError {
  return {
    message,
    error: true,
    code,
    details,
  };
}
