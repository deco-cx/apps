import type { AppContext } from "../mod.ts";
import type { YoutubeVideoResponse } from "../utils/types.ts";
import { getCookies } from "@std/http";

export interface YoutubeVideo {
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
    };
    channelTitle: string;
    tags?: string[];
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    dislikeCount?: string;
    favoriteCount: string;
    commentCount: string;
  };
  status?: {
    uploadStatus: string;
    privacyStatus: string;
    license: string;
    embeddable: boolean;
    publicStatsViewable: boolean;
  };
}

// Interface para as opções de consulta
interface VideoQueryOptions {
  channelId?: string;
  maxResults?: number;
  order?:
    | "date"
    | "rating"
    | "relevance"
    | "title"
    | "videoCount"
    | "viewCount";
  pageToken?: string;
  includePrivate?: boolean;
  videoId?: string;
}

/**
 * @title Fetch YouTube Videos
 */
export default async function loader(
  options: VideoQueryOptions,
  req: Request,
  ctx: AppContext,
): Promise<YoutubeVideoResponse | null> {
  // Verifica se há um token de acesso nos cookies
  const cookies = getCookies(req.headers);
  const accessToken = cookies.youtube_access_token;

  if (!accessToken) {
    console.log("Nenhum token de acesso disponível para buscar vídeos");
    return null;
  }

  try {
    let videos;

    // Se um videoId foi fornecido, busque diretamente esse vídeo específico
    if (options.videoId) {
      videos = await fetchVideoById(accessToken, options.videoId);
    } // Caso contrário, verifique se devemos incluir vídeos privados
    else if (options.includePrivate) {
      // Para incluir vídeos privados, precisamos usar a API de gestão de canais
      videos = await fetchChannelVideos(accessToken, options);
    } else {
      // Para vídeos públicos apenas, usamos a API de busca padrão
      videos = await fetchPublicVideos(accessToken, options);
    }

    // Se temos vídeos e IDs, buscamos estatísticas detalhadas
    // (Apenas se não buscamos diretamente pelo ID, que já traz estatísticas)
    if (!options.videoId && videos && videos.items && videos.items.length > 0) {
      const videoIds = videos.items.map((video: any) =>
        video.id.videoId || video.id
      ).join(",");

      const detailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,status&id=${videoIds}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();

        // Atualizamos os objetos de vídeo com as estatísticas detalhadas
        videos.items = detailsData.items;
      } else {
        console.error(
          "Erro ao buscar detalhes dos vídeos:",
          await detailsResponse.text(),
        );
      }
    }

    return videos;
  } catch (error) {
    console.error("Erro ao buscar vídeos do YouTube:", error);
    return null;
  }
}

/**
 * Busca um vídeo específico pelo ID
 */
async function fetchVideoById(
  accessToken: string,
  videoId: string,
): Promise<YoutubeVideoResponse | null> {
  // Adicionamos "status" para obter informações de privacidade
  const url =
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,status&id=${videoId}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Erro na requisição API (status ${response.status}): ${errorText}`,
      );
      return null;
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(`Erro ao buscar vídeo pelo ID ${videoId}:`, error);
    return null;
  }
}

/**
 * Busca vídeos públicos usando a API de pesquisa do YouTube
 */
async function fetchPublicVideos(
  accessToken: string,
  options: VideoQueryOptions,
): Promise<YoutubeVideoResponse | null> {
  // Construção da URL base
  let url = "https://www.googleapis.com/youtube/v3/search?part=snippet";
  url += `&maxResults=${options.maxResults || 10}`;
  url += `&order=${options.order || "date"}`;
  url += "&type=video";

  // Adiciona o channelId se fornecido
  if (options.channelId) {
    url += `&channelId=${options.channelId}`;
  }

  // Adiciona o pageToken se fornecido
  if (options.pageToken) {
    url += `&pageToken=${options.pageToken}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("Erro na resposta da API do YouTube:", await response.text());
    return null;
  }

  return await response.json();
}

/**
 * Busca todos os vídeos (incluindo privados) usando a API de gestão de canais
 */
async function fetchChannelVideos(
  accessToken: string,
  options: VideoQueryOptions,
): Promise<YoutubeVideoResponse | null> {
  // Se não temos um ID de canal, não podemos continuar
  if (!options.channelId) {
    console.error("channelId é necessário para buscar vídeos privados");
    return null;
  }

  // Para vídeos privados, usamos a API de "activities" ou "playlistItems" com a playlist de uploads do canal

  // Primeiro, obtemos a playlist de uploads do canal
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${options.channelId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!channelResponse.ok) {
    console.error(
      "Erro ao buscar detalhes do canal:",
      await channelResponse.text(),
    );
    return null;
  }

  const channelData = await channelResponse.json();

  if (!channelData.items || channelData.items.length === 0) {
    console.error("Detalhes do canal não encontrados");
    return null;
  }

  // Obtemos o ID da playlist de uploads do canal
  const uploadsPlaylistId =
    channelData.items[0].contentDetails.relatedPlaylists.uploads;

  if (!uploadsPlaylistId) {
    console.error("Playlist de uploads não encontrada para o canal");
    return null;
  }

  // Agora podemos buscar todos os vídeos da playlist de uploads
  let url =
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&playlistId=${uploadsPlaylistId}`;
  url += `&maxResults=${options.maxResults || 10}`;

  if (options.pageToken) {
    url += `&pageToken=${options.pageToken}`;
  }

  const videosResponse = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!videosResponse.ok) {
    console.error(
      "Erro ao buscar vídeos da playlist:",
      await videosResponse.text(),
    );
    return null;
  }

  const data = await videosResponse.json();

  // Formato para corresponder à resposta esperada
  const result: YoutubeVideoResponse = {
    kind: "youtube#videoListResponse",
    items: data.items.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      snippet: item.snippet,
    })),
    nextPageToken: data.nextPageToken,
    pageInfo: data.pageInfo || {
      totalResults: data.items.length,
      resultsPerPage: data.items.length,
    },
  };

  return result;
}
