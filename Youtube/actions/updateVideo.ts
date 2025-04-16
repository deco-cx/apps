import type { AppContext } from "../mod.ts";
import { getAccessToken } from "../utils/cookieAccessToken.ts";

interface UpdateVideoResult {
  success: boolean;
  message: string;
  video?: unknown;
}

export interface UpdateVideoOptionsAction {
  videoId: string;
  title?: string;
  description?: string;
  tags?: string | string[];
  privacyStatus?: "public" | "private" | "unlisted";
  tokenYoutube?: string;
}

/**
 * @title Ação para atualizar vídeo do YouTube
 */
export default async function action(
  props: UpdateVideoOptionsAction,
  req: Request,
  _ctx: AppContext,
): Promise<UpdateVideoResult> {
  if (!props.videoId) {
    console.error("ID do vídeo não fornecido");
    return { success: false, message: "ID do vídeo é obrigatório" };
  }

  // Obter o token de acesso dos cookies
  const accessToken = props.tokenYoutube || getAccessToken(req);

  if (!accessToken) {
    console.error("Token de acesso não encontrado nos cookies");
    return { success: false, message: "Autenticação necessária" };
  }

  // Primeiro, obter os dados atuais do vídeo para não perder informações
  const getResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,status&id=${props.videoId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!getResponse.ok) {
    const errorText = await getResponse.text();
    console.error("Erro ao obter dados do vídeo:", errorText);
    return {
      success: false,
      message:
        `Erro ao obter dados do vídeo: ${getResponse.status} ${getResponse.statusText}`,
    };
  }

  const videoData = await getResponse.json();

  if (!videoData.items || videoData.items.length === 0) {
    return { success: false, message: "Vídeo não encontrado" };
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
  if (props.tags !== undefined) snippet.tags = props.tags;
  if (props.privacyStatus !== undefined) {
    status.privacyStatus = props.privacyStatus;
  }

  // Montar o corpo da requisição
  const requestBody = {
    id: props.videoId,
    snippet,
    status,
  };

  // Enviar a requisição de atualização
  const updateResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,status`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
  );

  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    console.error("Erro ao atualizar vídeo:", errorText);
    return {
      success: false,
      message:
        `Erro ao atualizar vídeo: ${updateResponse.status} ${updateResponse.statusText}`,
    };
  }

  const updatedVideoData = await updateResponse.json();

  return {
    success: true,
    message: "Vídeo atualizado com sucesso",
    video: updatedVideoData,
  };
}
