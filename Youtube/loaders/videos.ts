import type { AppContext } from "../mod.ts";
import type { YoutubeVideoResponse } from "../utils/types.ts";
import { getCookies } from "@std/http";

/**
 * @title Fetch YouTube Videos
 */
export default async function loader(
  props: { channelId?: string; maxResults?: number },
  req: Request,
  ctx: AppContext,
): Promise<YoutubeVideoResponse | null> {
  // Verifica se há um token de acesso nos cookies
  const cookies = getCookies(req.headers);
  const accessToken = cookies.accessToken;
  
  if (!accessToken) {
    console.log("Nenhum token de acesso disponível para buscar vídeos");
    return null;
  }
  
  try {
    const { channelId, maxResults = 10 } = props;
    
    console.log(
      "Buscando vídeos do YouTube com token:",
      accessToken.substring(0, 10) + "...",
      channelId ? `para o canal ${channelId}` : "para meu canal"
    );
    
    // Construir URL com parâmetros
    const baseUrl = "https://www.googleapis.com/youtube/v3/search";
    const params = new URLSearchParams({
      part: "snippet",
      maxResults: maxResults.toString(),
      order: "date",
      type: "video",
    });
    
    // Se channelId foi fornecido, use-o, caso contrário, use 'mine=true'
    if (channelId) {
      params.append("channelId", channelId);
    } else {
      params.append("forMine", "true");
    }
    
    // Fazemos uma chamada direta com fetch usando o token de acesso
    const response = await fetch(
      `${baseUrl}?${params.toString()}`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro ao buscar vídeos:", errorData);
      throw new Error(
        `Falha ao buscar vídeos: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();
    console.log("Vídeos obtidos com sucesso:", result.items?.length || 0);
    
    // Buscar detalhes adicionais dos vídeos (como estatísticas)
    if (result.items && result.items.length > 0) {
      const videoIds = result.items.map((item: any) => 
        item.id.videoId || item.id
      ).filter(Boolean).join(",");
      
      if (videoIds) {
        const detailsUrl = "https://www.googleapis.com/youtube/v3/videos";
        const detailsParams = new URLSearchParams({
          part: "snippet,statistics",
          id: videoIds,
        });
        
        const detailsResponse = await fetch(
          `${detailsUrl}?${detailsParams.toString()}`,
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Accept": "application/json",
            },
          },
        );
        
        if (detailsResponse.ok) {
          const detailsResult = await detailsResponse.json();
          if (detailsResult.items && detailsResult.items.length > 0) {
            // Substituir os itens de pesquisa pelos detalhes completos
            result.items = detailsResult.items;
          }
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error("Erro ao processar requisição de vídeos:", error);
    return null;
  }
} 