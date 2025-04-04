import type { AppContext } from "../../mod.ts";
import getAccessToken from "../../utils/getAccessToken.ts";

export interface ResponderCommentProps {
  parentId: string;
  text: string;
  tokenYoutube?: string;
}

/**
 * @title Responder Comentário
 * @description Responde a um comentário existente no YouTube
 */
const action = async (
  props: ResponderCommentProps,
  req: Request,
  _ctx: AppContext,
) => {
  const { parentId, text } = props;
  const accessToken = props.tokenYoutube || getAccessToken(req);

  if (!accessToken) {
    return { success: false, message: "Autenticação necessária" };
  }

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
          Authorization: `Bearer ${accessToken}`,
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
  } catch (error) {
    console.error("Erro ao processar a resposta ao comentário:", error);
    return {
      success: false,
      message: `Erro ao responder comentário: ${error.message}`,
    };
  }
};

export default action;
