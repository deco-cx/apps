import type { AppContext } from "../mod.ts";
import { getCookies } from "@std/http";

export interface Props {
  /**
   * ID do vídeo do YouTube
   */
  videoId: string;
  /**
   * URL da imagem ou dados base64 da imagem para o thumbnail
   */
  imageData: string;
}

/**
 * @title Atualizar Thumbnail de Vídeo do YouTube
 * @description Atualiza a miniatura (thumbnail) personalizada de um vídeo do YouTube
 */
const action = async (
  props: Props,
  req: Request,
  _ctx: AppContext,
): Promise<{ success: boolean; message: string; thumbnail?: any }> => {
  console.log("Atualizando thumbnail do vídeo:", props.videoId);
  console.log("............................................................");
  console.log(" imageData",props.imageData);
  const { videoId, imageData } = props;

  // Validar dados
  if (!videoId) {
    return {
      success: false,
      message: "ID do vídeo é obrigatório",
    };
  }

  if (!imageData) {
    return {
      success: false,
      message: "Dados da imagem são obrigatórios",
    };
  }

  // Obter o token de acesso dos cookies
  const cookies = getCookies(req.headers);
  const accessToken = cookies.youtube_access_token;

  if (!accessToken) {
    console.error("Token de acesso não encontrado nos cookies");
    return { success: false, message: "Autenticação necessária" };
  }

  try {
    // Preparar o arquivo/blob para upload
    let imageBlob: Blob;
    
    if (typeof imageData === "string") {
      // Se for uma string base64, converter para Blob
      const base64Data = imageData.split(",")[1] || imageData;
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      
      const byteArray = new Uint8Array(byteArrays);
      imageBlob = new Blob([byteArray], { type: "image/jpeg" });
    } else {
      return {
        success: false,
        message: "Formato de imagem inválido",
      };
    }

    // Enviar a requisição para atualizar o thumbnail
    const updateResponse = await fetch(
      `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}&uploadType=media`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "image/jpeg", // Assumindo que é uma imagem JPEG
        },
        body: imageBlob,
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.text();
      console.error("Erro ao atualizar thumbnail:", errorData);
      return {
        success: false,
        message: `Erro ao atualizar thumbnail: ${updateResponse.status} ${updateResponse.statusText}`,
      };
    }

    const thumbnailData = await updateResponse.json();
    console.log("Thumbnail atualizado com sucesso:", thumbnailData);

    return {
      success: true,
      message: "Thumbnail atualizado com sucesso",
      thumbnail: thumbnailData,
    };
  } catch (error) {
    console.error("Erro durante a atualização do thumbnail:", error);
    return {
      success: false,
      message: `Erro durante a atualização do thumbnail: ${error.message || error}`,
    };
  }
};

export default action; 