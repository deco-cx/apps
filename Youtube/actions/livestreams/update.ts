import type { AppContext } from "../../mod.ts";
import getAccessToken from "../../utils/getAccessToken.ts";
import { LiveBroadcast, LiveBroadcastPrivacyStatus } from "../../utils/types.ts";

export interface UpdateLiveBroadcastParams {
  /**
   * @description ID da transmissão ao vivo
   */
  broadcastId: string;
  
  /**
   * @description Título da transmissão ao vivo (opcional)
   */
  title?: string;
  
  /**
   * @description Descrição da transmissão (opcional)
   */
  description?: string;
  
  /**
   * @description Data e hora de início agendado (opcional)
   */
  scheduledStartTime?: string;
  
  /**
   * @description Data e hora de término agendado (opcional)
   */
  scheduledEndTime?: string;
  
  /**
   * @description Status de privacidade (opcional)
   */
  privacyStatus?: LiveBroadcastPrivacyStatus;
  
  /**
   * @description Ativar DVR para replay posterior (opcional)
   */
  enableDvr?: boolean;
  
  /**
   * @description Ativar início automático quando o stream começar (opcional)
   */
  enableAutoStart?: boolean;
  
  /**
   * @description Ativar término automático quando o stream parar (opcional)
   */
  enableAutoStop?: boolean;
  
  /**
   * @description Conteúdo adequado para crianças (opcional)
   */
  madeForKids?: boolean;
  
  /**
   * @description Token de autorização do YouTube (opcional)
   */
  tokenYoutube?: string;
}

export interface UpdateLiveBroadcastResult {
  success: boolean;
  message: string;
  broadcast?: LiveBroadcast;
  error?: any;
}

/**
 * @title Atualizar Transmissão ao Vivo
 * @description Atualiza detalhes de uma transmissão ao vivo no YouTube
 */
export default async function action(
  props: UpdateLiveBroadcastParams,
  req: Request,
  _ctx: AppContext,
): Promise<UpdateLiveBroadcastResult> {
  const { 
    broadcastId,
    title,
    description,
    scheduledStartTime,
    scheduledEndTime,
    privacyStatus,
    enableDvr,
    enableAutoStart,
    enableAutoStop,
    madeForKids,
    tokenYoutube
  } = props;
  
  const accessToken = tokenYoutube || getAccessToken(req);
  
  if (!accessToken) {
    return {
      success: false,
      message: "Token de autenticação não encontrado"
    };
  }
  
  if (!broadcastId) {
    return {
      success: false,
      message: "ID da transmissão é obrigatório"
    };
  }
  
  try {
    // Primeiro buscar os detalhes atuais da transmissão
    const getUrl = new URL("https://youtube.googleapis.com/youtube/v3/liveBroadcasts");
    getUrl.searchParams.append("part", "id,snippet,contentDetails,status");
    getUrl.searchParams.append("id", broadcastId);
    
    const getResponse = await fetch(getUrl.toString(), {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
    
    if (!getResponse.ok) {
      const errorData = await getResponse.text();
      console.error("Erro ao buscar detalhes da transmissão:", errorData);
      return {
        success: false,
        message: `Erro ao buscar transmissão: ${getResponse.status} ${getResponse.statusText}`,
        error: errorData
      };
    }
    
    const broadcastData = await getResponse.json();
    
    if (!broadcastData.items || broadcastData.items.length === 0) {
      return {
        success: false,
        message: "Transmissão não encontrada"
      };
    }
    
    const broadcast = broadcastData.items[0];
    
    // Preparar o payload para atualização
    const payload: any = {
      id: broadcastId,
      snippet: {
        title: title || broadcast.snippet.title,
        description: description || broadcast.snippet.description,
        scheduledStartTime: scheduledStartTime || broadcast.snippet.scheduledStartTime,
        scheduledEndTime: scheduledEndTime !== undefined ? scheduledEndTime : broadcast.snippet.scheduledEndTime
      },
      status: {
        privacyStatus: privacyStatus || broadcast.status.privacyStatus,
        madeForKids: madeForKids !== undefined ? madeForKids : broadcast.status.madeForKids
      },
      contentDetails: {
        enableDvr: enableDvr !== undefined ? enableDvr : broadcast.contentDetails.enableDvr,
        enableAutoStart: enableAutoStart !== undefined ? enableAutoStart : broadcast.contentDetails.enableAutoStart,
        enableAutoStop: enableAutoStop !== undefined ? enableAutoStop : broadcast.contentDetails.enableAutoStop
      }
    };
    
    // Fazer a requisição para atualizar a transmissão
    const updateUrl = new URL("https://youtube.googleapis.com/youtube/v3/liveBroadcasts");
    updateUrl.searchParams.append("part", "id,snippet,contentDetails,status");
    
    const updateResponse = await fetch(updateUrl.toString(), {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.text();
      console.error("Erro ao atualizar transmissão:", errorData);
      return {
        success: false,
        message: `Erro ao atualizar transmissão: ${updateResponse.status} ${updateResponse.statusText}`,
        error: errorData
      };
    }
    
    const updatedBroadcast = await updateResponse.json();
    
    return {
      success: true,
      message: "Transmissão atualizada com sucesso",
      broadcast: updatedBroadcast
    };
  } catch (error) {
    console.error("Erro ao atualizar transmissão:", error);
    return {
      success: false,
      message: `Erro ao atualizar transmissão: ${error.message || "Erro desconhecido"}`,
      error
    };
  }
} 