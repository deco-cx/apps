import type { AppContext } from "../../mod.ts";
import getAccessToken from "../../utils/getAccessToken.ts";

export interface LikeCommentProps {
  commentId: string;
  rating: "like" | "dislike" | "none";
  tokenYoutube?: string;
}

/**
 * @title Dar Like em Comentário
 * @description Define a avaliação (like/dislike) em um comentário do YouTube
 */
const action = async (
  props: LikeCommentProps,
  req: Request,
  _ctx: AppContext,
) => {
  const { commentId, rating } = props;
  const accessToken = props.tokenYoutube || getAccessToken(req);

  if (!accessToken) {
    return { success: false, message: "Autenticação necessária" };
  }

  if (!commentId) {
    return { success: false, message: "ID do comentário é obrigatório" };
  }

  if (!rating) {
    return { success: false, message: "Avaliação (rating) é obrigatória" };
  }

  try {
    // O endereço correto conforme a documentação da API
    const url = new URL("https://youtube.googleapis.com/youtube/v3/comments/rate");
    url.searchParams.append("id", commentId);
    url.searchParams.append("rating", rating);

    console.log(`Enviando requisição para: ${url.toString()}`);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Length": "0", // importante: requisição sem corpo
      },
    });

    // A API de rate não retorna um corpo na resposta quando bem-sucedida
    // Ela retorna 204 No Content quando funciona
    if (response.status === 204) {
      console.log("Like aplicado com sucesso");
      return {
        success: true,
        message: `Comentário avaliado com sucesso: ${rating}`,
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro ao avaliar comentário: ${response.status} ${response.statusText}`, errorText);
      return {
        success: false,
        message: `Erro ao avaliar comentário: ${response.status} ${response.statusText}`,
        details: errorText || "API retornou erro sem detalhes",
        apiStatus: response.status,
      };
    }

    return {
      success: true,
      message: `Comentário avaliado com sucesso: ${rating}`,
    };
  } catch (error) {
    console.error("Erro ao processar a avaliação do comentário:", error);
    return {
      success: false,
      message: `Erro ao avaliar comentário: ${error.message}`,
    };
  }
};

export default action; 