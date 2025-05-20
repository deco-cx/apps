import type { PrivacyStatus } from "../../utils/types.ts";

export interface ChannelDefaultOptions {
  /**
   * @description Status de privacidade padrão para novos vídeos
   */
  privacyStatus?: PrivacyStatus;

  /**
   * @description Licença padrão para novos vídeos (youtube, creativeCommon)
   */
  license?: "youtube" | "creativeCommon";

  /**
   * @description Se novos vídeos podem ser incorporados em outros sites
   */
  embeddable?: boolean;

  /**
   * @description Se as estatísticas do vídeo são visíveis publicamente
   */
  publicStatsViewable?: boolean;

  /**
   * @description Se novos vídeos devem ser automaticamente publicados para a timeline do Google+
   */
  autoLevels?: boolean;

  /**
   * @description Se os comentários são permitidos por padrão em novos vídeos
   */
  defaultCommentSetting?: "enabled" | "disabled" | "moderatedWithLinkedAccount";

  /**
   * @description Categoria padrão para novos vídeos (ID da categoria)
   */
  categoryId?: string;

  /**
   * @description Tags padrão para novos vídeos
   */
  tags?: string[];

  /**
   * @description Idioma padrão para novos vídeos
   */
  defaultLanguage?: string;

  /**
   * @description Se a publicação automática na feed social está ativada
   */
  enableAutoShare?: boolean;
}

interface UpdateChannelDefaultsResult {
  success: boolean;
  message: string;
  defaults?: unknown;
}

/**
 * @title Configurar Padrões do Canal
 * @description Atualiza as configurações padrão para novos vídeos enviados ao canal
 */
export default async function action(
  props: ChannelDefaultOptions,
  req: Request,
  _ctx: unknown,
): Promise<UpdateChannelDefaultsResult> {
  const {
    privacyStatus,
    license,
    embeddable,
    publicStatsViewable,
    autoLevels,
    defaultCommentSetting,
    categoryId,
    tags,
    defaultLanguage,
    enableAutoShare,
  } = props;

  try {
    // Primeiro, obter os dados atuais do canal para não perder configurações
    const getResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=brandingSettings&mine=true`,
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

    // Obter o ID do canal e as configurações atuais
    const channelId = channelData.items[0].id;
    const currentChannel = channelData.items[0];

    // Criar uma cópia completa das configurações de branding
    const brandingSettings = {
      ...currentChannel.brandingSettings || {},
    };

    // Certifique-se de que as seções existem
    if (!brandingSettings.channel) {
      brandingSettings.channel = {};
    }

    if (!brandingSettings.defaults) {
      brandingSettings.defaults = {};
    }

    // Atualizar apenas os campos fornecidos
    if (privacyStatus !== undefined) {
      brandingSettings.defaults.privacyStatus = privacyStatus;
    }

    if (license !== undefined) {
      brandingSettings.defaults.license = license;
    }

    if (embeddable !== undefined) {
      brandingSettings.defaults.embeddable = embeddable;
    }

    if (publicStatsViewable !== undefined) {
      brandingSettings.defaults.publicStatsViewable = publicStatsViewable;
    }

    if (autoLevels !== undefined) {
      brandingSettings.defaults.autoLevels = autoLevels;
    }

    if (defaultCommentSetting !== undefined) {
      brandingSettings.defaults.commentingStatus = defaultCommentSetting;
    }

    if (categoryId !== undefined) {
      brandingSettings.defaults.categoryId = categoryId;
    }

    if (tags !== undefined) {
      brandingSettings.defaults.tags = tags;
    }

    if (defaultLanguage !== undefined) {
      brandingSettings.defaults.defaultLanguage = defaultLanguage;
    }

    if (enableAutoShare !== undefined) {
      brandingSettings.defaults.enableAutoShare = enableAutoShare;
    }

    // Montar o corpo da requisição - importante: usar APENAS brandingSettings
    const requestBody = {
      id: channelId,
      brandingSettings,
    };

    // Enviar a requisição de atualização
    const updateResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=brandingSettings`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error("Erro ao atualizar padrões do canal:", errorText);
      return {
        success: false,
        message:
          `Erro ao atualizar padrões: ${updateResponse.status} ${updateResponse.statusText}`,
      };
    }

    const updatedChannelData = await updateResponse.json();
    console.log("Padrões do canal atualizados com sucesso");

    return {
      success: true,
      message: "Padrões do canal atualizados com sucesso",
      defaults: updatedChannelData.brandingSettings?.defaults,
    };
  } catch (error) {
    console.error(
      "Erro ao processar a atualização dos padrões do canal:",
      error,
    );
    return {
      success: false,
      message: `Erro ao processar a solicitação: ${error.message}`,
    };
  }
}
