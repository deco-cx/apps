import type { AppContext } from "../mod.ts";
import { getAccessToken } from "../utils/cookieAccessToken.ts";

interface UpdateCategoryResult {
  success: boolean;
  message: string;
  video?: unknown;
}

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

  /**
   * @description Token de acesso do YouTube (opcional)
   */
  tokenYoutube?: string;
}

/**
 * @title Update Video Category
 * @description Updates the category of a YouTube video
 */
export default async function action(
  props: UpdateCategoryOptions,
  req: Request,
  _ctx: AppContext,
): Promise<UpdateCategoryResult> {
  if (!props.videoId) {
    console.error("ID do vídeo não fornecido");
    return { success: false, message: "ID do vídeo é obrigatório" };
  }

  if (!props.categoryId) {
    console.error("ID da categoria não fornecido");
    return { success: false, message: "ID da categoria é obrigatório" };
  }

  // Obter o token de acesso dos cookies ou do parâmetro
  const accessToken = props.tokenYoutube || getAccessToken(req);

  if (!accessToken) {
    console.error("Token de acesso não encontrado");
    return { success: false, message: "Autenticação necessária" };
  }

  try {
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

    // Atualizar a categoria
    snippet.categoryId = props.categoryId;

    // Montar o corpo da requisição
    const requestBody = {
      id: props.videoId,
      snippet,
    };

    // Enviar a requisição de atualização
    const updateResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet`,
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
      console.error("Erro ao atualizar categoria do vídeo:", errorText);
      return {
        success: false,
        message:
          `Erro ao atualizar categoria: ${updateResponse.status} ${updateResponse.statusText}`,
      };
    }

    const updatedVideoData = await updateResponse.json();
    console.log("Categoria do vídeo atualizada com sucesso:", updatedVideoData);

    return {
      success: true,
      message: "Categoria do vídeo atualizada com sucesso",
      video: updatedVideoData,
    };
  } catch (error) {
    console.error("Erro ao atualizar categoria do vídeo:", error);
    return {
      success: false,
      message: `Erro ao processar a solicitação: ${error.message}`,
    };
  }
}
