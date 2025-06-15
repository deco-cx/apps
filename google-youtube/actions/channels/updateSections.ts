export interface ChannelSection {
  /**
   * @description Tipo da seção (uploads, singlePlaylist, recentUploads, etc.)
   */
  type:
    | "allPlaylists"
    | "completedEvents"
    | "likedPlaylists"
    | "likes"
    | "liveEvents"
    | "multipleChannels"
    | "multiplePlaylists"
    | "popularUploads"
    | "recentUploads"
    | "singlePlaylist"
    | "subscriptions"
    | "upcomingEvents"
    | "uploads";

  /**
   * @description Estilo da seção (horizontalRow, verticalList)
   */
  style?: "horizontalRow" | "verticalList";

  /**
   * @description Título da seção (opcional)
   */
  title?: string;

  /**
   * @description ID(s) da(s) playlist(s) para a seção (obrigatório para tipo singlePlaylist e multiplePlaylists)
   */
  playlists?: string[];

  /**
   * @description ID(s) do(s) canal(is) para a seção (obrigatório para tipo multipleChannels)
   */
  channels?: string[];

  /**
   * @description Posição da seção (0 = topo, as seções são exibidas em ordem crescente)
   */
  position?: number;

  /**
   * @description A seção deve ser visível para usuários não inscritos no canal
   */
  showForNotSubscribed?: boolean;
}

export interface UpdateChannelSectionsOptions {
  /**
   * @description Seções a serem configuradas para o canal (adicionar ou atualizar)
   */
  sections: ChannelSection[];

  /**
   * @description IDs de seções a serem removidas (opcional)
   */
  removeSectionIds?: string[];
}

interface UpdateChannelSectionsResult {
  success: boolean;
  message: string;
  addedSections?: unknown[];
  updatedSections?: unknown[];
  removedSections?: string[];
}

/**
 * @title Configurar Seções do Canal
 * @description Adiciona, atualiza ou remove seções do canal (playlists, uploads, likes, etc.)
 */
export default async function action(
  props: UpdateChannelSectionsOptions,
  req: Request,
): Promise<UpdateChannelSectionsResult> {
  const { sections, removeSectionIds } = props;

  if (!sections || sections.length === 0) {
    console.error("Nenhuma seção fornecida");
    return {
      success: false,
      message:
        "É necessário fornecer pelo menos uma seção para adicionar/atualizar",
    };
  }

  // Obter o token de acesso
  const accessToken = req.headers.get("Authorization");

  if (!accessToken) {
    console.error("Token de acesso não encontrado");
    return { success: false, message: "Autenticação necessária" };
  }

  try {
    // Primeiro, obter as seções atuais para saber quais adicionar e quais atualizar
    const getResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channelSections?part=id,snippet,contentDetails&mine=true`,
      {
        headers: {
          Authorization: accessToken,
        },
      },
    );

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.error("Erro ao obter seções do canal:", errorText);
      return {
        success: false,
        message:
          `Erro ao obter seções do canal: ${getResponse.status} ${getResponse.statusText}`,
      };
    }

    const addedSections: unknown[] = [];
    const updatedSections: unknown[] = [];
    const removeResults: string[] = [];

    // Processar cada seção fornecida
    for (const section of sections) {
      // Preparar o objeto de seção para a API
      const sectionBody = {
        snippet: {
          type: section.type,
          style: section.style || "horizontalRow",
        },
        contentDetails: {},
      };

      // Adicionar propriedades opcionais
      if (section.title) {
        (sectionBody.snippet as Record<string, unknown>).title = section.title;
      }

      if (section.position !== undefined) {
        (sectionBody.snippet as Record<string, unknown>).position =
          section.position;
      }

      // Por padrão, mostrar para todos
      const localizable = {
        defaultLanguage: "pt-BR",
      };
      (sectionBody as Record<string, unknown>).localizations = {
        "pt-BR": localizable,
      };

      // Configurar visibilidade da seção
      (sectionBody.snippet as Record<string, unknown>).targetChannelId = "UC"; // Representa o próprio canal

      // Configurar para mostrar para usuários não inscritos (opcional)
      if (section.showForNotSubscribed !== undefined) {
        (sectionBody.snippet as Record<string, unknown>).showForNonSubscribers =
          section.showForNotSubscribed;
      }

      // Adicionar playlists ou canais conforme o tipo da seção
      if (
        (section.type === "singlePlaylist" ||
          section.type === "multiplePlaylists") && section.playlists?.length
      ) {
        (sectionBody.contentDetails as Record<string, unknown>).playlists =
          section.playlists;
      }

      if (section.type === "multipleChannels" && section.channels?.length) {
        (sectionBody.contentDetails as Record<string, unknown>).channels =
          section.channels;
      }

      // Enviar a requisição para adicionar ou atualizar a seção
      // Por simplicidade, sempre adicionamos novas seções
      const addResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channelSections?part=snippet,contentDetails`,
        {
          method: "POST",
          headers: {
            Authorization: accessToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sectionBody as Record<string, unknown>),
        },
      );

      if (!addResponse.ok) {
        console.error(
          `Erro ao adicionar seção de tipo ${section.type}:`,
          await addResponse.text(),
        );
        continue; // Continuar com as outras seções
      }

      const addedSection = await addResponse.json();
      addedSections.push(addedSection);
    }

    // Processar remoções de seções, se solicitado
    if (removeSectionIds && removeSectionIds.length > 0) {
      for (const sectionId of removeSectionIds) {
        const deleteResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channelSections?id=${sectionId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: accessToken,
            },
          },
        );

        if (deleteResponse.ok) {
          removeResults.push(sectionId);
        } else {
          console.error(
            `Erro ao remover seção ${sectionId}:`,
            await deleteResponse.text(),
          );
        }
      }
    }

    // Preparar o resultado da operação
    const result: UpdateChannelSectionsResult = {
      success: true,
      message:
        `Operação concluída: ${addedSections.length} seções adicionadas, ${removeResults.length} seções removidas`,
    };

    if (addedSections.length > 0) {
      result.addedSections = addedSections;
    }

    if (updatedSections.length > 0) {
      result.updatedSections = updatedSections;
    }

    if (removeResults.length > 0) {
      result.removedSections = removeResults;
    }

    return result;
  } catch (error: unknown) {
    let message = "Erro desconhecido";
    if (error instanceof Error) {
      message = error.message;
    }
    console.error(
      `Erro ao atualizar seção do canal: ${message}`,
    );
    return {
      success: false,
      message,
    };
  }
}
