import { getAccessToken } from "../../utils/cookieAccessToken.ts";

export interface UpdateChannelOptions {
  /**
   * @description ID do canal a ser atualizado
   */
  channelId: string;

  /**
   * @description Título do canal (opcional)
   */
  title?: string;

  /**
   * @description Descrição do canal (opcional)
   */
  description?: string;

  /**
   * @description ID do vídeo para definir como trailer do canal (opcional)
   */
  unsubscribedTrailer?: string;

  /**
   * @description Tags do canal, separadas por vírgula ou array (opcional)
   */
  keywords?: string | string[];

  /**
   * @description País de origem do canal (código de duas letras, ex: BR) (opcional)
   */
  country?: string;

  /**
   * @description Idioma padrão do canal (código, ex: pt-BR) (opcional)
   */
  defaultLanguage?: string;

  /**
   * @description Tópicos relacionados ao canal (IDs de tópicos do Freebase/Wiki) (opcional)
   */
  topicCategories?: string[];
}

interface UpdateChannelResult {
  success: boolean;
  message: string;
  channel?: unknown;
}

/**
 * @title Configure YouTube Channel
 * @description Updates various channel information such as description, trailer and other settings
 */
export default async function action(
  props: UpdateChannelOptions,
  req: Request,
  _ctx: unknown,
): Promise<UpdateChannelResult> {
  const {
    channelId,
    title,
    description,
    unsubscribedTrailer,
    keywords,
    country,
    defaultLanguage,
    topicCategories,
  } = props;

  if (!channelId) {
    console.error("ID do canal não fornecido");
    return { success: false, message: "ID do canal é obrigatório" };
  }

  try {
    // Primeiro, obter os dados atuais do canal para não perder informações
    const getResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,brandingSettings&id=${channelId}`,
    );

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.error("Erro ao obter dados do canal:", errorText);
      return {
        success: false,
        message:
          `Erro ao obter dados do canal: ${getResponse.status} ${getResponse.statusText}`,
      };
    }

    const channelData = await getResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      return { success: false, message: "Canal não encontrado" };
    }

    // Obter os dados atuais para fazer atualizações parciais
    const currentChannel = channelData.items[0];
    const snippet = { ...currentChannel.snippet };
    const brandingSettings = {
      ...currentChannel.brandingSettings,
      channel: { ...currentChannel.brandingSettings?.channel || {} },
    };

    // Atualizar campos no snippet
    let snippetUpdated = false;
    if (title !== undefined) {
      snippet.title = title;
      brandingSettings.channel.title = title;
      snippetUpdated = true;
    }

    if (description !== undefined) {
      snippet.description = description;
      brandingSettings.channel.description = description;
      snippetUpdated = true;
    }

    if (keywords !== undefined) {
      const keywordsArray = Array.isArray(keywords)
        ? keywords
        : keywords.split(",").map((k) => k.trim());

      snippet.tags = keywordsArray;

      // As palavras-chave no brandingSettings são uma string separada por espaço
      brandingSettings.channel.keywords = keywordsArray.join(" ");
      snippetUpdated = true;
    }

    if (defaultLanguage !== undefined) {
      snippet.defaultLanguage = defaultLanguage;
      snippetUpdated = true;
    }

    if (country !== undefined) {
      snippet.country = country;
      brandingSettings.channel.country = country;
      snippetUpdated = true;
    }

    if (topicCategories !== undefined) {
      snippet.topicCategories = topicCategories;
      snippetUpdated = true;
    }

    // Atualizar campos no brandingSettings
    let brandingUpdated = false;
    if (unsubscribedTrailer !== undefined) {
      brandingSettings.channel.unsubscribedTrailer = unsubscribedTrailer;
      brandingUpdated = true;
    }

    // Também consideramos atualizações de branding se os campos compartilhados foram alterados
    brandingUpdated = brandingUpdated ||
      title !== undefined ||
      description !== undefined ||
      keywords !== undefined ||
      country !== undefined;

    // Resultados das atualizações
    let snippetUpdateSuccess = true;
    let brandingUpdateSuccess = true;

    // 1. Atualizar o snippet, se necessário
    if (snippetUpdated) {
      const snippetRequestBody = {
        id: channelId,
        snippet,
      };

      const snippetResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(snippetRequestBody),
        },
      );

      if (!snippetResponse.ok) {
        const errorText = await snippetResponse.text();
        console.error("Erro ao atualizar snippet do canal:", errorText);
        snippetUpdateSuccess = false;
      } else {
        console.log("Snippet do canal atualizado com sucesso");
      }
    }

    // 2. Atualizar os brandingSettings, se necessário
    if (brandingUpdated) {
      const brandingRequestBody = {
        id: channelId,
        brandingSettings,
      };

      const brandingResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=brandingSettings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(brandingRequestBody),
        },
      );

      if (!brandingResponse.ok) {
        const errorText = await brandingResponse.text();
        console.error(
          "Erro ao atualizar brandingSettings do canal:",
          errorText,
        );
        brandingUpdateSuccess = false;
      } else {
        console.log("BrandingSettings do canal atualizados com sucesso");
      }
    }

    // 3. Buscar os dados atualizados do canal
    const updatedDataResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,brandingSettings&id=${channelId}`,
    );

    const updatedChannelData = await updatedDataResponse.json();

    // Verificar o resultado das operações
    if (!snippetUpdateSuccess && !brandingUpdateSuccess) {
      return {
        success: false,
        message: "Falha ao atualizar as informações do canal",
      };
    } else if (!snippetUpdateSuccess) {
      return {
        success: false,
        message:
          "Falha ao atualizar informações básicas do canal, mas configurações de marca podem ter sido atualizadas",
        channel: updatedChannelData.items?.[0],
      };
    } else if (!brandingUpdateSuccess) {
      return {
        success: false,
        message:
          "Falha ao atualizar configurações de marca do canal, mas informações básicas foram atualizadas",
        channel: updatedChannelData.items?.[0],
      };
    }

    return {
      success: true,
      message: "Canal atualizado com sucesso",
      channel: updatedChannelData.items?.[0],
    };
  } catch (error) {
    console.error("Erro ao processar a atualização do canal:", error);
    return {
      success: false,
      message: `Erro ao processar a solicitação: ${error.message}`,
    };
  }
}
