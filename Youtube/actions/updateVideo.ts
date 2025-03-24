import type { AppContext } from "../mod.ts";
import { UpdateVideoOptions } from "../loaders/updateVideo.ts";

interface UpdateVideoResult {
  success: boolean;
  message: string;
  video?: any;
}

export interface UpdateVideoOptionsAction {
  videoId: string;
  title?: string;
  description?: string;
  tags?: string | string[];
  privacyStatus?: "public" | "private" | "unlisted";
}

/**
 * @title Ação para atualizar vídeo do YouTube
 */
export default async function action(
  props: UpdateVideoOptionsAction,
  req: Request,
  ctx: AppContext,
): Promise<UpdateVideoResult> {
  console.log("Executando ação de atualização de vídeo");
  
  // Validar dados
  if (!props.videoId) {
    return {
      success: false,
      message: "ID do vídeo é obrigatório",
    };
  }
  
  // Preparar dados para a atualização
  const updateOptions: UpdateVideoOptions = {
    videoId: props.videoId,
  };
  
  // Adicionar campos opcionais apenas se forem fornecidos
  if (props.title) updateOptions.title = props.title;
  if (props.description) updateOptions.description = props.description;
  
  // Processar tags, que podem ser uma string ou um array
  if (props.tags) {
    if (typeof props.tags === 'string') {
      updateOptions.tags = props.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean);
    } else {
      // Se já for um array, usamos diretamente
      updateOptions.tags = props.tags;
    }
  }
  
  if (props.privacyStatus) updateOptions.privacyStatus = props.privacyStatus;
  
  // Chamar o loader para atualizar o vídeo
  const result: UpdateVideoResult = await ctx.invoke.Youtube.loaders.updateVideo(updateOptions);
  
  // Retornar o resultado da operação
  return result;
} 