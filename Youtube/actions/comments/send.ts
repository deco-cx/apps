import type { AppContext } from "../../mod.ts";
import getAccessToken from "../../utils/getAccessToken.ts";

export interface SendCommentProps {
  videoId: string;
  text: string;
  /**
   * @description Define se o comentário deve ser pinado no vídeo (requer permissão de proprietário do vídeo)
   */
  pinComment?: boolean;
  /**
   * @description Token de acesso do YouTube (opcional)
   */
  tokenYoutube?: string;
}

/**
 * @title Enviar Comentário
 * @description Envia um novo comentário em um vídeo do YouTube com opção de pinar o comentário
 */
const action = async (
  props: SendCommentProps,
  req: Request,
  _ctx: AppContext,
) => {
  const { videoId, text, pinComment = false } = props;
  const accessToken = props.tokenYoutube || getAccessToken(req);

  if (!accessToken) {
    return { success: false, message: "Autenticação necessária" };
  }
  
  if (!videoId) {
    return { success: false, message: "ID do vídeo é obrigatório" };
  }

  if (!text || text.trim() === "") {
    return { success: false, message: "Texto do comentário é obrigatório" };
  }

  try {

    // Enviar o comentário
    const response = await fetch(
      "https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            videoId,
            topLevelComment: {
              snippet: {
                textOriginal: text,
              },
            },
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Erro ao enviar comentário: ${response.status}`, errorData);
      return { 
        success: false, 
        message: `Erro ao enviar comentário: ${response.status} ${response.statusText}`,
        details: errorData
      };
    }

    const commentData = await response.json();
    
    // Se o usuário deseja pinar o comentário e o envio foi bem-sucedido
    if (pinComment && commentData && commentData.id) {
      try {
        // Requisição para pinar o comentário
        const pinUrl = new URL("https://youtube.googleapis.com/youtube/v3/comments/setModerationStatus");
        pinUrl.searchParams.append("id", commentData.snippet.topLevelComment.id);
        pinUrl.searchParams.append("moderationStatus", "published");
        pinUrl.searchParams.append("banAuthor", "false");
        
        const pinResponse = await fetch(
          pinUrl.toString(),
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Length": "0", // importante: requisição sem corpo
            },
          }
        );
        
        // Verificando resposta 204 No Content (sucesso)
        if (pinResponse.status === 204) {
          console.log("Status de moderação definido com sucesso");
        } else if (!pinResponse.ok) {
          const pinErrorText = await pinResponse.text();
          console.warn("O comentário foi enviado, mas não foi possível piná-lo", pinErrorText);
          return {
            success: true,
            message: "Comentário enviado com sucesso, mas não foi possível piná-lo (verifique se você é o proprietário do vídeo)",
            comment: commentData,
            pinned: false,
            pinError: pinErrorText
          };
        }
        
        // Requisição específica para marcar como "destacado"
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
              id: commentData.snippet.topLevelComment.id,
              snippet: {
                ...commentData.snippet.topLevelComment.snippet,
                isPublic: true,
                moderationStatus: "published",
                textOriginal: text,
              }
            })
          }
        );
        
        if (!highlightResponse.ok) {
          const highlightErrorText = await highlightResponse.text();
          console.warn("Problema ao destacar o comentário", highlightErrorText);
          return {
            success: true,
            message: "Comentário enviado com sucesso, mas houve um problema ao destacá-lo",
            comment: commentData,
            pinned: false,
            highlightError: highlightErrorText
          };
        }
        
        return {
          success: true,
          message: "Comentário enviado e pinado com sucesso",
          comment: commentData,
          pinned: true
        };
      } catch (pinError) {
        console.error("Erro ao tentar pinar o comentário:", pinError);
        return {
          success: true,
          message: "Comentário enviado com sucesso, mas ocorreu um erro ao piná-lo",
          comment: commentData,
          pinned: false,
          error: pinError.message
        };
      }
    }

    return {
      success: true,
      message: "Comentário enviado com sucesso",
      comment: commentData,
      pinned: false
    };
  } catch (error) {
    console.error("Erro ao processar a requisição de comentário:", error);
    return { 
      success: false, 
      message: `Erro ao processar a requisição: ${error.message}` 
    };
  }
};

export default action; 