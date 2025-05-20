import type { AppContext } from "../../mod.ts";

export interface LikeCommentProps {
  commentId: string;
  rating: "like" | "dislike" | "none";
}

/**
 * @title Like YouTube Comment
 * @description Sets the rating (like/dislike) on a YouTube comment
 */
const action = async (
  props: LikeCommentProps,
  _req: Request,
  ctx: AppContext,
) => {
  const { commentId, rating } = props;

  if (!commentId) {
    return { success: false, message: "ID do comentário é obrigatório" };
  }

  if (!rating) {
    return { success: false, message: "Avaliação (rating) é obrigatória" };
  }

  try {
    // O endereço correto conforme a documentação da API
    const url = new URL(
      "https://youtube.googleapis.com/youtube/v3/comments/rate",
    );
    url.searchParams.append("id", commentId);
    url.searchParams.append("rating", rating);

    console.log(`Enviando requisição para: ${url.toString()}`);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ctx.access_token}`,
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
      console.error(
        `Erro ao avaliar comentário: ${response.status} ${response.statusText}`,
        errorText,
      );
      return {
        success: false,
        message:
          `Erro ao avaliar comentário: ${response.status} ${response.statusText}`,
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
