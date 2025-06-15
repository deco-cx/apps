import type { AppContext } from "../../mod.ts";

export interface ResponderCommentProps {
  parentId: string;
  text: string;
}

/**
 * @title Responder Comentário
 * @description Responde a um comentário existente no YouTube
 */
const action = async (
  props: ResponderCommentProps,
  _req: Request,
  ctx: AppContext,
) => {
  const { parentId, text } = props;

  if (!parentId) {
    return { success: false, message: "ID do comentário pai é obrigatório" };
  }

  if (!text || text.trim() === "") {
    return { success: false, message: "Texto da resposta é obrigatório" };
  }

  try {
    const response = await fetch(
      "https://youtube.googleapis.com/youtube/v3/comments?part=snippet",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            parentId,
            textOriginal: text,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Erro ao responder comentário: ${response.status} ${response.statusText}`,
        errorText,
      );
      return {
        success: false,
        message:
          `Erro ao responder comentário: ${response.status} ${response.statusText}`,
        details: errorText,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Resposta enviada com sucesso",
      comment: data,
    };
  } catch (error: unknown) {
    let message = "Erro desconhecido";
    if (error instanceof Error) {
      message = error.message;
    }
    return {
      success: false,
      message: `Erro ao responder comentário: ${message}`,
    };
  }
};

export default action;
