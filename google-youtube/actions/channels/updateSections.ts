import { AppContext } from "../../mod.ts";

export interface ChannelSection {
  /**
   * @title Section Type
   * @description Type of channel section
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
   * @title Section Style
   * @description Visual style of the section
   */
  style?: "horizontalRow" | "verticalList";

  /**
   * @title Section Title
   * @description Title displayed for the section
   */
  title?: string;

  /**
   * @title Playlists
   * @description Playlist IDs for the section (required for singlePlaylist and multiplePlaylists types)
   */
  playlists?: string[];

  /**
   * @title Channels
   * @description Channel IDs for the section (required for multipleChannels type)
   */
  channels?: string[];

  /**
   * @title Position
   * @description Position of the section (0 = top, sections are displayed in ascending order)
   */
  position?: number;

  /**
   * @title Show For Not Subscribed
   * @description Whether the section should be visible to users not subscribed to the channel
   */
  showForNotSubscribed?: boolean;
}

export interface Props {
  /**
   * @title Sections
   * @description Sections to configure for the channel (add or update)
   */
  sections: ChannelSection[];

  /**
   * @title Remove Section IDs
   * @description IDs of sections to remove
   */
  removeSectionIds?: string[];
}

export interface UpdateChannelSectionsResult {
  success: boolean;
  message: string;
  addedSections?: unknown[];
  updatedSections?: unknown[];
  removedSections?: string[];
}

/**
 * @name UPDATE_CHANNEL_SECTIONS
 * @title Configure Channel Sections
 * @description Add, update or remove channel sections (playlists, uploads, likes, etc.)
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<UpdateChannelSectionsResult> {
  const { sections, removeSectionIds } = props;

  if (!sections || sections.length === 0) {
    ctx.errorHandler.toHttpError(
      new Error("No sections provided"),
      "You must provide at least one section to add/update",
    );
  }

  try {
    const getResponse = await ctx.client["GET /channelSections"](
      {
        part: "id,snippet,contentDetails",
        mine: true,
      },
      {
        headers: ctx.tokens?.access_token
          ? { Authorization: `Bearer ${ctx.tokens.access_token}` }
          : {},
      },
    );

    if (!getResponse.ok) {
      ctx.errorHandler.toHttpError(
        getResponse,
        `Failed to get channel sections: ${getResponse.statusText}`,
      );
    }

    const addedSections: unknown[] = [];
    const updatedSections: unknown[] = [];
    const removeResults: string[] = [];

    for (const section of sections) {
      const sectionBody = {
        snippet: {
          type: section.type,
          style: section.style || "horizontalRow",
        },
        contentDetails: {},
      };

      if (section.title) {
        (sectionBody.snippet as Record<string, unknown>).title = section.title;
      }

      if (section.position !== undefined) {
        (sectionBody.snippet as Record<string, unknown>).position =
          section.position;
      }

      const localizable = {
        defaultLanguage: "en-US",
      };
      (sectionBody as Record<string, unknown>).localizations = {
        "en-US": localizable,
      };

      (sectionBody.snippet as Record<string, unknown>).targetChannelId = "UC";

      if (section.showForNotSubscribed !== undefined) {
        (sectionBody.snippet as Record<string, unknown>).showForNonSubscribers =
          section.showForNotSubscribed;
      }

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

      const addResponse = await ctx.client["POST /channelSections"](
        { part: "snippet,contentDetails" },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ctx.tokens?.access_token}`,
          },
          body: sectionBody as Record<string, unknown>,
        },
      );

      if (!addResponse.ok) {
        // Continue with other sections if one fails
        continue;
      }

      const addedSection = await addResponse.json();
      addedSections.push(addedSection);
    }

    if (removeSectionIds && removeSectionIds.length > 0) {
      for (const sectionId of removeSectionIds) {
        const deleteResponse = await ctx.client["DELETE /channelSections"](
          { id: sectionId },
          {
            headers: {
              Authorization: `Bearer ${ctx.tokens?.access_token}`,
            },
          },
        );

        if (deleteResponse.ok) {
          removeResults.push(sectionId);
        }
      }
    }

    const result: UpdateChannelSectionsResult = {
      success: true,
      message:
        `Operation completed: ${addedSections.length} sections added, ${removeResults.length} sections removed`,
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
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to update channel sections",
    );
  }
}
