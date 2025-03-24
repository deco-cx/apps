import type { AppContext } from "../mod.ts";
import type { YoutubeChannelResponse } from "../utils/types.ts";
import { getCookies } from "@std/http";

/**
 * @title Fetch YouTube Channels
 */
export default async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<YoutubeChannelResponse | null> {
  // Verifica se há um token de acesso nos cookies
  const cookies = getCookies(req.headers);
  const accessToken = cookies.accessToken;
  
  if (!accessToken) {
    console.log("Nenhum token de acesso disponível para buscar canais");
    return null;
  }
  
  try {
    console.log("Buscando canais do YouTube com token:", accessToken.substring(0, 10) + "...");
    
    // Fazemos uma chamada direta com fetch usando o token de acesso
    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro ao buscar canais:", errorData);
      throw new Error(`Falha ao buscar canais: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Canais obtidos com sucesso:", result.items?.length || 0);
    return result;
  } catch (error) {
    console.error("Erro ao processar requisição de canais:", error);
    return null;
  }
}
