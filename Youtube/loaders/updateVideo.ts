import type { AppContext } from "../mod.ts";
import { getCookies } from "@std/http";

// Interface de entrada para atualização de vídeo
export interface UpdateVideoOptions {
  videoId: string;
  title?: string;
  description?: string;
  tags?: string[];
  categoryId?: string;
  privacyStatus?: "public" | "private" | "unlisted";
}

/**
 * @title Atualizar Vídeo do YouTube
 */
export default async function loader(
  options: UpdateVideoOptions,
  req: Request,
  _ctx: AppContext,
): Promise<{ success: boolean; message: string; video?: any }> {
  console.log("............................................................");
  console.log("Iniciando atualização de vídeo do YouTube:", options);
  console.log("............................................................");

  // Verificar se o ID do vídeo foi fornecido
  if (!options.videoId) {
    console.error("ID do vídeo não fornecido");
    return { success: false, message: "ID do vídeo é obrigatório" };
  }

  // Obter o token de acesso dos cookies
  const cookies = getCookies(req.headers);
  const accessToken = cookies.youtube_access_token;

  if (!accessToken) {
    console.error("Token de acesso não encontrado nos cookies");
    return { success: false, message: "Autenticação necessária" };
  }

    // Primeiro, obter os dados atuais do vídeo para não perder informações
    const getResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,status&id=${options.videoId}`,
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
    if (options.title !== undefined) snippet.title = options.title;
    if (options.description !== undefined) {
      snippet.description = options.description;
    }
    if (options.tags !== undefined) snippet.tags = options.tags;
    if (options.categoryId !== undefined) {
      snippet.categoryId = options.categoryId;
    }
    if (options.privacyStatus !== undefined) {
      status.privacyStatus = options.privacyStatus;
    }

    // Montar o corpo da requisição
    const requestBody = {
      id: options.videoId,
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
    console.log("Vídeo atualizado com sucesso:", updatedVideoData);

    return {
      success: true,
      message: "Vídeo atualizado com sucesso",
      video: updatedVideoData,
    };
}
