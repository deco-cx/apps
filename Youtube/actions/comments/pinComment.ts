import type { AppContext } from "../../mod.ts";
import getAccessToken from "../../utils/getAccessToken.ts";

export interface PinCommentProps {
  /**
   * @description ID do comentário a ser pinado
   */
  commentId: string;
  
  /**
   * @description Token de acesso do YouTube (opcional)
   */
  tokenYoutube?: string;
}

interface PinCommentResult {
  success: boolean;
  message: string;
  pinned?: boolean;
  details?: string;
}

/**
 * @title Pinar Comentário
 * @description Pina um comentário específico em um vídeo (requer ser proprietário do vídeo)
 */
const action = async (
  props: PinCommentProps,
  req: Request,
  _ctx: AppContext,
): Promise<PinCommentResult> => {
  const { commentId } = props;
  const accessToken = props.tokenYoutube || getAccessToken(req);

  if (!accessToken) {
    return { success: false, message: "Autenticação necessária" };
  }

  if (!commentId) {
    return { success: false, message: "ID do comentário é obrigatório" };
  }

  try {
    console.log(`Tentando pinar comentário: ${commentId}`);
    
    // Primeiro, obter os dados atuais do comentário
    const getUrl = new URL("https://youtube.googleapis.com/youtube/v3/comments");
    getUrl.searchParams.append("part", "snippet");
    getUrl.searchParams.append("id", commentId);
    
    console.log(`Buscando dados do comentário: ${getUrl.toString()}`);
    
    const getResponse = await fetch(
      getUrl.toString(),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.error("Erro ao obter dados do comentário:", errorText);
      return {
        success: false,
        message: `Erro ao obter dados do comentário: ${getResponse.status} ${getResponse.statusText}`,
        details: errorText
      };
    }

    const commentData = await getResponse.json();
    
    if (!commentData.items || commentData.items.length === 0) {
      return { success: false, message: "Comentário não encontrado" };
    }

    // Requisição para definir o status de moderação do comentário
    const moderationUrl = new URL("https://youtube.googleapis.com/youtube/v3/comments/setModerationStatus");
    moderationUrl.searchParams.append("id", commentId);
    moderationUrl.searchParams.append("moderationStatus", "published");
    moderationUrl.searchParams.append("banAuthor", "false");
    
    console.log(`Definindo status de moderação: ${moderationUrl.toString()}`);
    
    const moderationResponse = await fetch(
      moderationUrl.toString(),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Length": "0", // importante: requisição sem corpo
        }
      }
    );
    
    // Verificação específica para 204 No Content (sucesso sem corpo)
    if (moderationResponse.status === 204) {
      console.log("Status de moderação definido com sucesso");
    } else if (!moderationResponse.ok) {
      const errorText = await moderationResponse.text();
      console.error("Erro ao definir status de moderação:", errorText);
      return {
        success: false,
        message: "Não foi possível pinar o comentário. Verifique se você é o proprietário do vídeo.",
        pinned: false,
        details: errorText
      };
    }
    
    // Requisição para marcar o comentário como destacado
    const commentSnippet = commentData.items[0].snippet;
    
    const highlightUrl = new URL("https://youtube.googleapis.com/youtube/v3/comments");
    highlightUrl.searchParams.append("part", "snippet");
    
    const highlightResponse = await fetch(
      highlightUrl.toString(),
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: commentId,
          snippet: {
            ...commentSnippet,
            isPublic: true,
            moderationStatus: "published"
          }
        })
      }
    );
    
    if (!highlightResponse.ok) {
      const errorText = await highlightResponse.text();
      console.error("Erro ao destacar o comentário:", errorText);
      return {
        success: false,
        message: "O comentário foi moderado, mas não foi possível destacá-lo",
        pinned: false,
        details: errorText
      };
    }

    return {
      success: true,
      message: "Comentário pinado com sucesso",
      pinned: true
    };
  } catch (error) {
    console.error("Erro ao pinar comentário:", error);
    return {
      success: false,
      message: `Erro ao processar a solicitação: ${error.message}`,
      pinned: false
    };
  }
};

export default action; 