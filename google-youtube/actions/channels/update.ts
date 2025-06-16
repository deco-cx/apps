import { AppContext } from "../../mod.ts";
import { COMMON_ERROR_MESSAGES, YOUTUBE_PARTS } from "../../utils/constant.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID of the channel to be updated
   */
  channelId: string;

  /**
   * @title Title
   * @description Channel title
   */
  title?: string;

  /**
   * @title Description
   * @description Channel description
   */
  description?: string;

  /**
   * @title Unsubscribed Trailer
   * @description Video ID to set as channel trailer
   */
  unsubscribedTrailer?: string;

  /**
   * @title Keywords
   * @description Channel keywords, comma separated or array
   */
  keywords?: string | string[];

  /**
   * @title Country
   * @description Channel country (two-letter code, e.g. US)
   */
  country?: string;

  /**
   * @title Default Language
   * @description Channel default language (code, e.g. en-US)
   */
  defaultLanguage?: string;

  /**
   * @title Topic Categories
   * @description Channel topic categories (Freebase/Wiki topic IDs)
   */
  topicCategories?: string[];
}

export interface UpdateChannelResult {
  success: boolean;
  message: string;
  channel?: unknown;
}

/**
 * @name UPDATE_CHANNEL
 * @title Configure YouTube Channel
 * @description Updates various channel information such as description, trailer and other settings
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
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
    ctx.errorHandler.toHttpError(
      new Error(COMMON_ERROR_MESSAGES.MISSING_CHANNEL_ID),
      COMMON_ERROR_MESSAGES.MISSING_CHANNEL_ID,
    );
  }

  try {
    const getResponse = await ctx.client["GET /channels"](
      {
        part: `${YOUTUBE_PARTS.SNIPPET},brandingSettings`,
        id: channelId,
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
        `Failed to get channel data: ${getResponse.statusText}`,
      );
    }

    const channelData = await getResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      ctx.errorHandler.toHttpError(
        new Error("Channel not found"),
        `Channel not found: ${channelId}`,
      );
    }

    const currentChannel = channelData.items[0];
    const snippet = { ...currentChannel.snippet };
    const brandingSettings = {
      ...currentChannel.brandingSettings,
      channel: { ...currentChannel.brandingSettings?.channel || {} },
    };

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

    let brandingUpdated = false;
    if (unsubscribedTrailer !== undefined) {
      brandingSettings.channel.unsubscribedTrailer = unsubscribedTrailer;
      brandingUpdated = true;
    }

    brandingUpdated = brandingUpdated ||
      title !== undefined ||
      description !== undefined ||
      keywords !== undefined ||
      country !== undefined;

    let snippetUpdateSuccess = true;
    let brandingUpdateSuccess = true;

    if (snippetUpdated) {
      const snippetRequestBody = {
        id: channelId,
        snippet,
      };

      const snippetResponse = await ctx.client["PUT /channels"](
        { part: YOUTUBE_PARTS.SNIPPET },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ctx.tokens?.access_token}`,
          },
          body: snippetRequestBody,
        },
      );

      if (!snippetResponse.ok) {
        snippetUpdateSuccess = false;
      }
    }

    if (brandingUpdated) {
      const brandingRequestBody = {
        id: channelId,
        brandingSettings,
      };

      const brandingResponse = await ctx.client["PUT /channels"](
        { part: "brandingSettings" },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ctx.tokens?.access_token}`,
          },
          body: brandingRequestBody,
        },
      );

      if (!brandingResponse.ok) {
        brandingUpdateSuccess = false;
      }
    }

    const updatedDataResponse = await ctx.client["GET /channels"](
      {
        part: `${YOUTUBE_PARTS.SNIPPET},brandingSettings`,
        id: channelId,
      },
      {
        headers: ctx.tokens?.access_token
          ? { Authorization: `Bearer ${ctx.tokens.access_token}` }
          : {},
      },
    );

    const updatedChannelData = await updatedDataResponse.json();

    if (!snippetUpdateSuccess && !brandingUpdateSuccess) {
      return {
        success: false,
        message: "Failed to update channel information",
      };
    } else if (!snippetUpdateSuccess) {
      return {
        success: false,
        message:
          "Failed to update basic channel information, but branding settings may have been updated",
        channel: updatedChannelData.items?.[0],
      };
    } else if (!brandingUpdateSuccess) {
      return {
        success: false,
        message:
          "Failed to update channel branding settings, but basic information was updated",
        channel: updatedChannelData.items?.[0],
      };
    }

    return {
      success: true,
      message: "Channel updated successfully",
      channel: updatedChannelData.items?.[0],
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to process channel update request",
    );
  }
}
